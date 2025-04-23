import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const gulp = require('gulp');

// Import the default task from gulpfile
import defaultTask from '../gulpfile.js';

// Register and run the task
gulp.task('default', defaultTask);
gulp.series('default')((err) => {
  if (err) console.error(err);
});