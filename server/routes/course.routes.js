const courseRouter = require("express").Router();

// middleware
const authMiddleware = require("../middleware/authentication");

// controller
const courseController = require("../controller/course.controller");

// routes
courseRouter.post(
  "/create",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  courseController.create
);
courseRouter.get(
  "/get",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  courseController.getAllCourses
);
courseRouter.patch(
  "/update/:courseId",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  courseController.update
);
courseRouter.get(
  "/find/:courseId",
  authMiddleware.isAuthenticated,
  courseController.findCourseWithoutBuy
);
courseRouter.get(
  "/find",
  authMiddleware.isAuthenticated,
  courseController.findAllCourseWithoutBuy
);
courseRouter.get(
  "/get-content/:courseId",
  authMiddleware.isAuthenticated,
  courseController.getCourseDataValidUser
);

courseRouter.patch(
  "/add/question/:courseId",
  authMiddleware.isAuthenticated,
  courseController.addQuestion
);
courseRouter.patch(
  "/add/question-reply/:courseId",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  courseController.addQuestionsReply
);
courseRouter.patch(
  "/add/review/:courseId",
  authMiddleware.isAuthenticated,
  courseController.addReview
);
courseRouter.patch(
  "/add/review-reply/:courseId",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  courseController.addReviewReply
);
courseRouter.delete(
  "/delete",
  authMiddleware.isAuthenticated,
  authMiddleware.authorizeRole("admin"),
  courseController.deleteCourse
);

module.exports = courseRouter;
