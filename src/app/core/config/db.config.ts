import { DBConfig } from 'ngx-indexed-db';

export const dbConfig: DBConfig = {
  name: 'StudyPlanDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'studyPlans',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'resume', keypath: 'resume', options: { unique: false } },
        { name: 'jobDescription', keypath: 'jobDescription', options: { unique: false } },
        { name: 'prepDays', keypath: 'prepDays', options: { unique: false } },
        { name: 'sections', keypath: 'sections', options: { unique: false } },
        { name: 'createdAt', keypath: 'createdAt', options: { unique: false } },
      ],
    },
    {
      store: 'sectionMaterials',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'sectionId', keypath: 'sectionId', options: { unique: false } }, // Link to section in a plan (composite key logic might be needed or just unique IDs for sections)
        { name: 'slides', keypath: 'slides', options: { unique: false } },
        { name: 'flashcards', keypath: 'flashcards', options: { unique: false } },
        { name: 'quiz', keypath: 'quiz', options: { unique: false } },
        { name: 'versionHistory', keypath: 'versionHistory', options: { unique: false } },
      ],
    },
  ],
};
