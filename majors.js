// Major Requirements Database
// Based on common California Community College IGETC + major prep requirements
// for UC transfer. Each major maps to an array of required courses.

export const MAJOR_CATEGORIES = {
  'Engineering / Computer Science': [
    'Computer Science B.S.',
    'Computer Engineering B.S.',
    'Electrical Engineering B.S.',
    'Mechanical Engineering B.S.',
    'Civil Engineering B.S.',
    'Chemical Engineering B.S.',
    'Data Science B.S.',
  ],
  'Natural / Biological Sciences': [
    'Biology B.S.',
    'Chemistry B.S.',
    'Biochemistry B.S.',
    'Physics B.S.',
    'Environmental Science B.S.',
    'Neuroscience B.S.',
    'Microbiology B.S.',
  ],
  'Business / Economics': [
    'Business Administration B.S.',
    'Economics B.A.',
    'Accounting B.S.',
    'Finance B.S.',
    'Marketing B.S.',
  ],
  'Humanities / Social Sciences': [
    'Psychology B.A.',
    'Sociology B.A.',
    'Political Science B.A.',
    'History B.A.',
    'English B.A.',
    'Philosophy B.A.',
    'Communications B.A.',
    'Anthropology B.A.',
  ],
  'Arts / Design': [
    'Film & Media Studies B.A.',
    'Architecture B.S.',
    'Cognitive Science B.S.',
    'Linguistics B.A.',
    'Mathematics B.S.',
    'Statistics B.S.',
  ],
};

export const ALL_MAJORS = Object.values(MAJOR_CATEGORIES).flat();

// UC campuses offering TAG
export const TAG_CAMPUSES = [
  'UC Davis',
  'UC Irvine',
  'UC Merced',
  'UC Riverside',
  'UC Santa Barbara',
  'UC Santa Cruz',
];

// All UC campuses (for general tracking)
export const ALL_UC_CAMPUSES = [
  'UC Berkeley',
  'UCLA',
  'UC San Diego',
  'UC Davis',
  'UC Irvine',
  'UC Santa Barbara',
  'UC Santa Cruz',
  'UC Riverside',
  'UC Merced',
];

export const MAJOR_REQUIREMENTS = {
  'Computer Science B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'MATH 55', title: 'Discrete Mathematics', units: 4, category: 'Math Core', required: true },
    { code: 'CS 61A', title: 'Structure and Interpretation of Computer Programs', units: 4, category: 'CS Core', required: true },
    { code: 'CS 61B', title: 'Data Structures', units: 4, category: 'CS Core', required: true },
    { code: 'CS 61C', title: 'Machine Structures', units: 4, category: 'CS Core', required: true },
    { code: 'CS 70', title: 'Discrete Math and Probability Theory', units: 4, category: 'CS Core', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists and Engineers', units: 4, category: 'Science', required: true },
    { code: 'PHYS 7B', title: 'Physics for Scientists and Engineers II', units: 4, category: 'Science', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Computer Engineering B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'CS 61A', title: 'Structure of Computer Programs', units: 4, category: 'CS Core', required: true },
    { code: 'CS 61C', title: 'Machine Structures', units: 4, category: 'CS Core', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Science', required: true },
    { code: 'PHYS 7B', title: 'Physics for Scientists II', units: 4, category: 'Science', required: true },
    { code: 'PHYS 7C', title: 'Physics for Scientists III', units: 4, category: 'Science', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ELEC 50', title: 'Introduction to Electrical Engineering', units: 3, category: 'Engineering Core', required: true },
  ],

  'Electrical Engineering B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Science', required: true },
    { code: 'PHYS 7B', title: 'Physics for Scientists II', units: 4, category: 'Science', required: true },
    { code: 'PHYS 7C', title: 'Physics for Scientists III', units: 4, category: 'Science', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry', units: 5, category: 'Science', required: true },
    { code: 'ELEC 50', title: 'Circuit Analysis I', units: 3, category: 'Engineering Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Mechanical Engineering B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 53', title: 'Multivariable Calculus', units: 4, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Science', required: true },
    { code: 'PHYS 7B', title: 'Physics for Scientists II', units: 4, category: 'Science', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry', units: 5, category: 'Science', required: true },
    { code: 'ENGR 37', title: 'Statics', units: 3, category: 'Engineering Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Civil Engineering B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 53', title: 'Multivariable Calculus', units: 4, category: 'Math Core', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Science', required: true },
    { code: 'PHYS 7B', title: 'Physics for Scientists II', units: 4, category: 'Science', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry', units: 5, category: 'Science', required: true },
    { code: 'ENGR 37', title: 'Statics', units: 3, category: 'Engineering Core', required: true },
    { code: 'CE 1', title: 'Introduction to Civil Engineering', units: 2, category: 'Engineering Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Chemical Engineering B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 53', title: 'Multivariable Calculus', units: 4, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 1B', title: 'General Chemistry II', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 3A', title: 'Organic Chemistry I', units: 4, category: 'Chemistry', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Science', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Data Science B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'STAT 20', title: 'Introduction to Probability and Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'CS 61A', title: 'Structure of Computer Programs', units: 4, category: 'CS Core', required: true },
    { code: 'CS 61B', title: 'Data Structures', units: 4, category: 'CS Core', required: true },
    { code: 'DATA 8', title: 'Foundations of Data Science', units: 4, category: 'Data Science Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Biology B.S.': [
    { code: 'BIO 1A', title: 'General Biology Lecture', units: 3, category: 'Biology Core', required: true },
    { code: 'BIO 1AL', title: 'General Biology Lab', units: 2, category: 'Biology Core', required: true },
    { code: 'BIO 1B', title: 'General Biology II', units: 4, category: 'Biology Core', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry I', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 1B', title: 'General Chemistry II', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 3A', title: 'Organic Chemistry I', units: 4, category: 'Chemistry', required: true },
    { code: 'CHEM 3B', title: 'Organic Chemistry II', units: 4, category: 'Chemistry', required: false },
    { code: 'MATH 10A', title: 'Methods of Mathematics: Calculus', units: 4, category: 'Math', required: true },
    { code: 'PHYS 8A', title: 'Introductory Physics', units: 4, category: 'Physics', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Chemistry B.S.': [
    { code: 'CHEM 1A', title: 'General Chemistry I', units: 5, category: 'Chemistry Core', required: true },
    { code: 'CHEM 1B', title: 'General Chemistry II', units: 5, category: 'Chemistry Core', required: true },
    { code: 'CHEM 3A', title: 'Organic Chemistry I', units: 4, category: 'Chemistry Core', required: true },
    { code: 'CHEM 3B', title: 'Organic Chemistry II', units: 4, category: 'Chemistry Core', required: true },
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Physics', required: true },
    { code: 'PHYS 7B', title: 'Physics for Scientists II', units: 4, category: 'Physics', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Biochemistry B.S.': [
    { code: 'CHEM 1A', title: 'General Chemistry I', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 1B', title: 'General Chemistry II', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 3A', title: 'Organic Chemistry I', units: 4, category: 'Chemistry', required: true },
    { code: 'CHEM 3B', title: 'Organic Chemistry II', units: 4, category: 'Chemistry', required: true },
    { code: 'BIO 1A', title: 'General Biology I', units: 3, category: 'Biology', required: true },
    { code: 'BIO 1AL', title: 'General Biology Lab', units: 2, category: 'Biology', required: true },
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math', required: true },
    { code: 'PHYS 8A', title: 'Introductory Physics', units: 4, category: 'Physics', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Physics B.S.': [
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Physics Core', required: true },
    { code: 'PHYS 7B', title: 'Physics for Scientists II', units: 4, category: 'Physics Core', required: true },
    { code: 'PHYS 7C', title: 'Physics for Scientists III', units: 4, category: 'Physics Core', required: true },
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math', required: true },
    { code: 'MATH 53', title: 'Multivariable Calculus', units: 4, category: 'Math', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry I', units: 5, category: 'Science', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Environmental Science B.S.': [
    { code: 'BIO 1A', title: 'General Biology I', units: 3, category: 'Biology', required: true },
    { code: 'BIO 1AL', title: 'General Biology Lab', units: 2, category: 'Biology', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry I', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 1B', title: 'General Chemistry II', units: 5, category: 'Chemistry', required: false },
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Math', required: true },
    { code: 'GEOG 1', title: 'Physical Geography', units: 3, category: 'Earth Science', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Neuroscience B.S.': [
    { code: 'BIO 1A', title: 'General Biology I', units: 3, category: 'Biology', required: true },
    { code: 'BIO 1AL', title: 'General Biology Lab', units: 2, category: 'Biology', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry I', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 3A', title: 'Organic Chemistry I', units: 4, category: 'Chemistry', required: false },
    { code: 'PSYC 1', title: 'General Psychology', units: 3, category: 'Psychology', required: true },
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math', required: true },
    { code: 'PHYS 8A', title: 'Introductory Physics', units: 4, category: 'Physics', required: false },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Math', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Microbiology B.S.': [
    { code: 'BIO 1A', title: 'General Biology I', units: 3, category: 'Biology', required: true },
    { code: 'BIO 1AL', title: 'General Biology Lab', units: 2, category: 'Biology', required: true },
    { code: 'BIO 1B', title: 'General Biology II', units: 4, category: 'Biology', required: true },
    { code: 'CHEM 1A', title: 'General Chemistry I', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 1B', title: 'General Chemistry II', units: 5, category: 'Chemistry', required: true },
    { code: 'CHEM 3A', title: 'Organic Chemistry I', units: 4, category: 'Chemistry', required: true },
    { code: 'MATH 10A', title: 'Methods of Mathematics', units: 4, category: 'Math', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Business Administration B.S.': [
    { code: 'ECON 1', title: 'Introduction to Economics', units: 3, category: 'Economics', required: true },
    { code: 'ECON 2', title: 'Principles of Microeconomics', units: 3, category: 'Economics', required: true },
    { code: 'MATH 16A', title: 'Analytic Geometry & Calculus I', units: 3, category: 'Math', required: true },
    { code: 'MATH 16B', title: 'Analytic Geometry & Calculus II', units: 3, category: 'Math', required: true },
    { code: 'UGBA 10', title: 'Principles of Business', units: 3, category: 'Business Core', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'ACCT 1A', title: 'Financial Accounting', units: 4, category: 'Accounting', required: true },
    { code: 'BUS 18', title: 'Business Law', units: 3, category: 'Business Core', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Economics B.A.': [
    { code: 'ECON 1', title: 'Principles of Macroeconomics', units: 3, category: 'Economics Core', required: true },
    { code: 'ECON 2', title: 'Principles of Microeconomics', units: 3, category: 'Economics Core', required: true },
    { code: 'MATH 16A', title: 'Analytic Geometry & Calculus I', units: 3, category: 'Math', required: true },
    { code: 'MATH 16B', title: 'Analytic Geometry & Calculus II', units: 3, category: 'Math', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: false },
  ],

  'Accounting B.S.': [
    { code: 'ACCT 1A', title: 'Financial Accounting', units: 4, category: 'Accounting Core', required: true },
    { code: 'ACCT 1B', title: 'Managerial Accounting', units: 4, category: 'Accounting Core', required: true },
    { code: 'ECON 1', title: 'Macroeconomics', units: 3, category: 'Economics', required: true },
    { code: 'ECON 2', title: 'Microeconomics', units: 3, category: 'Economics', required: true },
    { code: 'MATH 16A', title: 'Business Calculus I', units: 3, category: 'Math', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'BUS 18', title: 'Business Law', units: 3, category: 'Business', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Finance B.S.': [
    { code: 'ACCT 1A', title: 'Financial Accounting', units: 4, category: 'Accounting', required: true },
    { code: 'ECON 1', title: 'Macroeconomics', units: 3, category: 'Economics', required: true },
    { code: 'ECON 2', title: 'Microeconomics', units: 3, category: 'Economics', required: true },
    { code: 'MATH 16A', title: 'Business Calculus I', units: 3, category: 'Math', required: true },
    { code: 'MATH 16B', title: 'Business Calculus II', units: 3, category: 'Math', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Marketing B.S.': [
    { code: 'ECON 1', title: 'Macroeconomics', units: 3, category: 'Economics', required: true },
    { code: 'ECON 2', title: 'Microeconomics', units: 3, category: 'Economics', required: true },
    { code: 'UGBA 10', title: 'Principles of Business', units: 3, category: 'Business Core', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'ACCT 1A', title: 'Financial Accounting', units: 4, category: 'Accounting', required: false },
    { code: 'COMM 1', title: 'Public Speaking', units: 3, category: 'Communication', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Psychology B.A.': [
    { code: 'PSYC 1', title: 'General Psychology', units: 3, category: 'Psychology Core', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'BIO 1A', title: 'General Biology I', units: 3, category: 'Biology', required: false },
    { code: 'PSYC 5', title: 'Research Methods in Psychology', units: 3, category: 'Psychology Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'SOCIOL 1', title: 'Introduction to Sociology', units: 3, category: 'Social Science', required: false },
  ],

  'Sociology B.A.': [
    { code: 'SOCIOL 1', title: 'Introduction to Sociology', units: 3, category: 'Sociology Core', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'SOCIOL 5', title: 'Social Problems', units: 3, category: 'Sociology Core', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'POLSCI 1', title: 'Introduction to Political Science', units: 3, category: 'Social Science', required: false },
  ],

  'Political Science B.A.': [
    { code: 'POLSCI 1', title: 'Introduction to Political Science', units: 3, category: 'PolSci Core', required: true },
    { code: 'POLSCI 2', title: 'American Government', units: 3, category: 'PolSci Core', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: false },
    { code: 'ECON 1', title: 'Macroeconomics', units: 3, category: 'Social Science', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'HIST 7A', title: 'History of the United States', units: 3, category: 'History', required: false },
  ],

  'History B.A.': [
    { code: 'HIST 7A', title: 'History of the United States I', units: 3, category: 'History Core', required: true },
    { code: 'HIST 7B', title: 'History of the United States II', units: 3, category: 'History Core', required: true },
    { code: 'HIST 4A', title: 'History of Western Civilization I', units: 3, category: 'History Core', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'POLSCI 2', title: 'American Government', units: 3, category: 'Social Science', required: false },
  ],

  'English B.A.': [
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'English Core', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'English Core', required: true },
    { code: 'ENGL 4', title: 'Introduction to Literature', units: 3, category: 'English Core', required: true },
    { code: 'ENGL 10', title: 'Survey of British Literature I', units: 3, category: 'Literature', required: false },
    { code: 'ENGL 43A', title: 'Creative Writing', units: 3, category: 'Writing', required: false },
    { code: 'PHIL 7', title: 'Critical Thinking', units: 3, category: 'Humanities', required: false },
  ],

  'Philosophy B.A.': [
    { code: 'PHIL 1', title: 'Introduction to Philosophy', units: 3, category: 'Philosophy Core', required: true },
    { code: 'PHIL 3', title: 'Introduction to Logic', units: 3, category: 'Philosophy Core', required: true },
    { code: 'PHIL 7', title: 'Critical Thinking', units: 3, category: 'Philosophy Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'MATH 16A', title: 'Calculus I', units: 3, category: 'Math', required: false },
  ],

  'Communications B.A.': [
    { code: 'COMM 1', title: 'Public Speaking', units: 3, category: 'Communications Core', required: true },
    { code: 'COMM 4', title: 'Interpersonal Communication', units: 3, category: 'Communications Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'SOCIOL 1', title: 'Introduction to Sociology', units: 3, category: 'Social Science', required: false },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: false },
  ],

  'Anthropology B.A.': [
    { code: 'ANTH 1', title: 'Biological Anthropology', units: 3, category: 'Anthropology Core', required: true },
    { code: 'ANTH 2', title: 'Cultural Anthropology', units: 3, category: 'Anthropology Core', required: true },
    { code: 'ANTH 3', title: 'Introduction to Archaeology', units: 3, category: 'Anthropology Core', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: false },
    { code: 'BIO 1A', title: 'General Biology I', units: 3, category: 'Science', required: false },
  ],

  'Film & Media Studies B.A.': [
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'FILM 1', title: 'Introduction to Film', units: 3, category: 'Film Core', required: true },
    { code: 'FILM 10', title: 'History of Film', units: 3, category: 'Film Core', required: false },
    { code: 'COMM 1', title: 'Public Speaking', units: 3, category: 'Communications', required: false },
  ],

  'Architecture B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math', required: true },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Physics', required: true },
    { code: 'ARCH 1', title: 'Introduction to Architecture', units: 3, category: 'Architecture Core', required: true },
    { code: 'ART 7A', title: 'Drawing I', units: 3, category: 'Design', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
  ],

  'Cognitive Science B.S.': [
    { code: 'PSYC 1', title: 'General Psychology', units: 3, category: 'Psychology', required: true },
    { code: 'CS 61A', title: 'Structure of Computer Programs', units: 4, category: 'CS', required: true },
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: true },
    { code: 'PHIL 3', title: 'Introduction to Logic', units: 3, category: 'Philosophy', required: true },
    { code: 'LING 1', title: 'Introduction to Linguistics', units: 3, category: 'Linguistics', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Linguistics B.A.': [
    { code: 'LING 1', title: 'Introduction to Linguistics', units: 3, category: 'Linguistics Core', required: true },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
    { code: 'ENGL 1B', title: 'Reading and Composition II', units: 4, category: 'General Ed', required: true },
    { code: 'PHIL 3', title: 'Introduction to Logic', units: 3, category: 'Philosophy', required: false },
    { code: 'PSYC 1', title: 'General Psychology', units: 3, category: 'Psychology', required: false },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics', required: false },
  ],

  'Mathematics B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 53', title: 'Multivariable Calculus', units: 4, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'MATH 55', title: 'Discrete Mathematics', units: 4, category: 'Math Core', required: true },
    { code: 'CS 61A', title: 'Structure of Computer Programs', units: 4, category: 'CS', required: false },
    { code: 'PHYS 7A', title: 'Physics for Scientists I', units: 4, category: 'Science', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],

  'Statistics B.S.': [
    { code: 'MATH 1A', title: 'Calculus I', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 1B', title: 'Calculus II', units: 5, category: 'Math Core', required: true },
    { code: 'MATH 53', title: 'Multivariable Calculus', units: 4, category: 'Math Core', required: true },
    { code: 'MATH 54', title: 'Linear Algebra & Differential Equations', units: 4, category: 'Math Core', required: true },
    { code: 'STAT 20', title: 'Introduction to Statistics', units: 4, category: 'Statistics Core', required: true },
    { code: 'CS 61A', title: 'Structure of Computer Programs', units: 4, category: 'CS', required: false },
    { code: 'ENGL 1A', title: 'Reading and Composition', units: 4, category: 'General Ed', required: true },
  ],
};

// TAG GPA requirements by campus and major category
export const TAG_REQUIREMENTS = {
  'UC Davis': {
    'Engineering / Computer Science': { minGpa: 3.5, notes: 'Select majors may require higher GPA' },
    'Natural / Biological Sciences': { minGpa: 3.2, notes: '' },
    'Business / Economics': { minGpa: 3.2, notes: '' },
    'Humanities / Social Sciences': { minGpa: 3.2, notes: '' },
    'Arts / Design': { minGpa: 3.2, notes: '' },
  },
  'UC Irvine': {
    'Engineering / Computer Science': { minGpa: 3.4, notes: 'CS requires completion of calculus sequence' },
    'Natural / Biological Sciences': { minGpa: 3.4, notes: '' },
    'Business / Economics': { minGpa: 3.4, notes: '' },
    'Humanities / Social Sciences': { minGpa: 3.4, notes: '' },
    'Arts / Design': { minGpa: 3.4, notes: '' },
  },
  'UC Merced': {
    'Engineering / Computer Science': { minGpa: 3.0, notes: '' },
    'Natural / Biological Sciences': { minGpa: 2.9, notes: '' },
    'Business / Economics': { minGpa: 2.8, notes: '' },
    'Humanities / Social Sciences': { minGpa: 2.8, notes: '' },
    'Arts / Design': { minGpa: 2.8, notes: '' },
  },
  'UC Riverside': {
    'Engineering / Computer Science': { minGpa: 3.0, notes: 'CS specifically requires 3.6 GPA' },
    'Natural / Biological Sciences': { minGpa: 2.8, notes: '' },
    'Business / Economics': { minGpa: 2.8, notes: '' },
    'Humanities / Social Sciences': { minGpa: 2.8, notes: '' },
    'Arts / Design': { minGpa: 2.8, notes: '' },
  },
  'UC Santa Barbara': {
    'Engineering / Computer Science': { minGpa: 3.4, notes: '' },
    'Natural / Biological Sciences': { minGpa: 3.4, notes: '' },
    'Business / Economics': { minGpa: 3.4, notes: '' },
    'Humanities / Social Sciences': { minGpa: 3.4, notes: '' },
    'Arts / Design': { minGpa: 3.4, notes: '' },
  },
  'UC Santa Cruz': {
    'Engineering / Computer Science': { minGpa: 3.0, notes: '' },
    'Natural / Biological Sciences': { minGpa: 3.0, notes: '' },
    'Business / Economics': { minGpa: 3.0, notes: '' },
    'Humanities / Social Sciences': { minGpa: 3.0, notes: '' },
    'Arts / Design': { minGpa: 3.0, notes: '' },
  },
};
