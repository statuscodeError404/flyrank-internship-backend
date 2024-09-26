const express = require("express");
const { getCourses, getCourse, addCourse, uppdateCourse, deleteCourse } = require("../controllers/courses");

const router = express.Router({ margeParams: true });

router.route('/').get(getCourses);
router.route('/:id').get(getCourse).put(uppdateCourse).delete(deleteCourse);



router.route('/:bootcampId/courses').post(addCourse);



module.exports = router;