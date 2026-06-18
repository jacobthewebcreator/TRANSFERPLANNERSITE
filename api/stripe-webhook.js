import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const APP_ID = 'pathmaker-production';

async function setUserPremium(firebaseUserId, isPremium, subscriptionData = {}) {
  const ref = db
    .collection('artifacts')
    .doc(APP_ID)
    .collection('users')
    .doc(firebaseUserId)
    .collection('settings')
    .doc('profile');

  await ref.set(
    {
      isPremium,
      subscriptionStatus: subscriptionData.status || (isPremium ? 'active' : 'canceled'),
      subscriptionId: subscriptionData.subscriptionId || null,
      trialEnd: subscriptionData.trialEnd || null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export const config = {
  api: {
    bodyParser: false, // Required for Stripe webhook signature verification
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const getFirebaseUserId = (obj) =>
    obj?.metadata?.firebaseUserId || obj?.subscription_data?.metadata?.firebaseUserId;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const firebaseUserId = getFirebaseUserId(session);
        if (firebaseUserId) {
          // Trial starts — mark as premium immediately
          await setUserPremium(firebaseUserId, true, {
            status: 'trialing',
            subscriptionId: session.subscription,
            trialEnd: session.subscription_data?.trial_end
              ? new Date(session.subscription_data.trial_end * 1000).toISOString()
              : null,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const firebaseUserId = sub.metadata?.firebaseUserId;
        if (firebaseUserId) {
          const isPremium = ['active', 'trialing'].includes(sub.status);
          await setUserPremium(firebaseUserId, isPremium, {
            status: sub.status,
            subscriptionId: sub.id,
            trialEnd: sub.trial_end
              ? new Date(sub.trial_end * 1000).toISOString()
              : null,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const firebaseUserId = sub.metadata?.firebaseUserId;
        if (firebaseUserId) {
          await setUserPremium(firebaseUserId, false, {
            status: 'canceled',
            subscriptionId: sub.id,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const firebaseUserId = sub.metadata?.firebaseUserId;
        if (firebaseUserId) {
          await setUserPremium(firebaseUserId, false, {
            status: 'past_due',
            subscriptionId: sub.id,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
