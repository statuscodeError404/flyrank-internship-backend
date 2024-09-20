const express = require("express");
const { getCourses, getCourse, addCourse } = require("../controllers/courses");

const router = express.Router({ margeParams: true });

router.route('/').get(getCourses);
router.route('/:id').get(getCourse);



router.route('/:bootcampId/courses').post(addCourse);



module.exports = router;