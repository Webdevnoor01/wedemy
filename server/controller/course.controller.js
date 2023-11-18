const { Types } = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const { redis } = require("../utils/redis");
const ejs = require("ejs");
const path = require("path");

// services
const courseService = require("../service/course.service");
const imageUploadService = require("../service/imageUpload.service");
const mailService = require("../service/mail.service");
// models
const courseModel = require("../models/course.model");
const notificationService = require("../service/notification.service");
class CourseController {
  async create(req, res, next) {
    try {
      const data = req.body;
      if (Object.keys(data).length <= 0)
        return next(new ErrorHandler("Course data can not be empty", 400));
      //  Upload the Course thumbnail
      if (data.thumbnail) {
        const thumbnail = await imageUploadService.upload(
          data.thumbnail[0],
          "courseThumbnail"
        );
        if (thumbnail.error)
          return next(new ErrorHandler(thumbnail.message, 400));
        data.thumbnail = thumbnail;
      }

      //   create the course
      const course = await courseService.create(data);
      if (course.error) return next(new ErrorHandler(course.message));

      res.status(201).json({
        success: true,
        message: "The course is created successfully",
        course: course,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // update course data
  async update(req, res, next) {
    try {
      const { courseId } = req.params;
      const data = req.body;
      if (Object.keys(data).length <= 0)
        return next(new ErrorHandler("Data can not be empty", 400));
      if (!courseId)
        return next(new ErrorHandler("Please provide curseId as params", 400));

      const isCourse = await courseService.find(courseId);
      if (isCourse.error) return next(new ErrorHandler(isCourse.message, 400));

      // upload thumbnail if available
      if (data.thumbnail) {
        const isImageDelete = await imageUploadService.remove(
          data.thumbnail?.publicId
        );
        if (isImageDelete.error)
          return next(new ErrorHandler(isImageDelete.message, 400));

        const newImage = await imageUploadService.upload(
          data.thumbnail[0],
          "courseThumbnail"
        );
        if (newImage.error)
          return next(new ErrorHandler(newImage.message, 400));

        data.thumbnail.publicId = newImage.publicId;
        data.thumbnail.url = newImage.url;
      }
      const updateCourse = await courseService.update(courseId, data);
      if (updateCourse.error)
        return next(new ErrorHandler(updateCourse.message, 400));
      res.status(201).json({
        success: true,
        message: "course data updated successfully",
        data: updateCourse,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // find all course(this for admin)
  async getAllCourses(_req, res, next){

    try {
      const courses = await courseService.find()
      if(courses.error) return next(new ErrorHandler(courses.message, 400))

      res.status(200).json({
        success:true,
        courses
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 400))
    }
  }

  // find Single course without purchasing
  async findCourseWithoutBuy(req, res, next) {
    const { courseId } = req.params;
    try {
      if (!courseId || courseId.length < 24)
        return next(new ErrorHandler("Please provide valid courseId", 400));

      const isCourseCacheExist = await redis.get(courseId);
      if (isCourseCacheExist) {
        console.log("hitting redis");
        return res.status(200).json({
          success: true,
          data: JSON.parse(isCourseCacheExist),
        });
      } else {
        console.log("hitting mongodb");
        const course = await courseService.findById(
          courseId,
          "-courseData.videoUrl -courseData.suggestation -courseData.links -courseData.questions"
        );
        if (course.error) return next(new ErrorHandler(course.message));
        await redis.set(courseId, JSON.stringify(course));
        return res.status(200).json({
          success: true,
          data: course,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
  // find all course without purchasing
  async findAllCourseWithoutBuy(_req, res, next) {
    try {
      const isCoursesCacheExist = await redis.get("allCourses");
      if (isCoursesCacheExist) {
        return res.status(200).json({
          success: true,
          data: JSON.parse(isCoursesCacheExist),
        });
      } else {
        const courses = await courseService.find(
          "-courseData.videoUrl -courseData.suggestation -courseData.links -courseData.questions"
        );
        if (courses.error) return next(new ErrorHandler(courses.message));
        await redis.set("allCourses", JSON.stringify(courses));
        return res.status(200).json({
          success: true,
          data: courses,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // get course for valid user(who purchace this course)
  async getCourseDataValidUser(req, res, next) {
    try {
      const courseId = req.params.courseId;
      const courseList = req.user.courses;
      const isCourseExist = courseList.find(
        (course) => course.id.toString() === courseId
      );
      if (!isCourseExist)
        return next(
          new ErrorHandler("You are not eligable for this course", 400)
        );

      const course = await courseService.findById(courseId);
      if (course.error) return next(new ErrorHandler(course.message, 400));

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // add question into the course
  async addQuestion(req, res, next) {
    try {
      const { courseId } = req.params;
      const { question, contentId } = req.body;

      // make sure the body is not empty
      if (!question || !courseId || !contentId)
        return next(
          new ErrorHandler(
            "question, courseId, and contentId are required.",
            400
          )
        );
      // validate course id
      const isValidCourseId = Types.ObjectId.isValid(courseId);
      if (!isValidCourseId)
        return next(new ErrorHandler("Please provide valid courseId", 400));

      // validate content id
      const isValidContentId = Types.ObjectId.isValid(contentId);
      if (!isValidContentId)
        return next(new ErrorHandler("Please provide valid contentId", 400));

      // find course from the database
      const course = await courseModel.findById(courseId).select("+courseData");
      if (!course) return next(new ErrorHandler(course.message, 400));

      // serching the exact course content by matching contentId
      const courseContent = course.courseData.find((item) =>
        item._id.equals(contentId)
      );
      if (!courseContent)
        return next(new ErrorHandler("Please provide valid contentId", 400));

      // new question payload
      const newQuestion = {
        question,
        user: {
          name: req?.user?.name,
          email: req?.user?.email,
          id: req?.user?._id,
          avatar: req?.user?.avatar,
          role: req?.user?.role,
        },
        questionReqlies: [],
      };

      // set new question into the coruse content
      courseContent.questions.push(newQuestion);
      // finaly save the new question
      await course?.save();

      // create notification
      const notificaitonPayload = {
        title: "New Question",
        message: `You have a new questin in ${course?.name}`,
        user: {
          name: req?.user?.name,
          email: req?.user?.email,
          avatar: req?.user?.avatar,
          role: req?.user?.role,
        },
      };
      const notification = await notificationService.create(
        notificaitonPayload
      );

      res.status(200).json({
        success: true,
        message: "Question created successfully",
        data: courseContent,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // add question replies into the course content
  async addQuestionsReply(req, res, next) {
    try {
      const { courseId } = req.params;
      const { questionReply, contentId, questionId } = req.body;

      // make sure body is not empty
      if (!questionReply || !contentId || !questionId)
        return next(
          new ErrorHandler(
            "questionReply, contentId, and questionId are required "
          )
        );

      // validate the course id
      const isValidCourseId = Types.ObjectId.isValid(courseId);
      if (!isValidCourseId)
        return next(new ErrorHandler("Please provide valid courseId", 400));

      // validate content id
      const isValidContentId = Types.ObjectId.isValid(contentId);
      if (!isValidContentId)
        return next(new ErrorHandler("Please provide valid contentId", 400));

      // validate question id
      const isValidquestionId = Types.ObjectId.isValid(questionId);
      if (!isValidquestionId)
        return next(new ErrorHandler("Please provide valid questionId", 400));

      // find the course from the database
      const course = await courseModel.findById(courseId).select("+courseData");
      if (!course) return next(new ErrorHandler("Course not found", 400));

      // searching course content by matching contentId
      const courseContent = course.courseData.find((item) =>
        item._id.equals(contentId)
      );

      // find selected question from the courseContent by matching questonId
      let selectedQuestion;
      if (courseContent.questions.length > 1) {
        selectedQuestion = courseContent.questions.find((question) =>
          question._id.equals(questionId)
        );
      } else {
        selectedQuestion = courseContent.questions[0];
      }

      // new question reply payload
      const newQuestionReply = {
        answer: questionReply,
        user: {
          name: req?.user?.name,
          id: req?.user?._id,
          avatar: req?.user?.avatar,
          role: req?.user?.role,
        },
      };
      // set new question reply into the selected question
      selectedQuestion.questionReplies?.push(newQuestionReply);

      // finaly 🥳 save the course with new question reply
      await course?.save();

      // send email to the user about his/her question reply
      if (req?.user?._id === selectedQuestion?.user?.id) {
        // TODO: send notification
        const data = {
          name: selectedQuestion.user.name,
          title: courseContent.title,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs")
        );

        try {
          const mail = await mailService.send(
            selectedQuestion.user.email,
            "Question reply",
            html,
            data
          );
        } catch (error) {
          console.log(error);
          return next(new ErrorHandler(error.message, 400));
        }
      } else {
        const data = {
          name: selectedQuestion.user.name,
          title: courseContent.title,
          email: selectedQuestion.user.email,
        };
        console.log(data);
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );
        console.log(data);
        try {
          const mail = await mailService.send(
            selectedQuestion.user.email,
            "Question reply",
            "question-reply.ejs",
            data
          );
        } catch (error) {
          console.log(error);
          return next(new ErrorHandler(error.message, 400));
        }
      }
      res.status(200).json({
        success: true,
        message: "question replied successfully",
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // Add review into a course
  async addReview(req, res, next) {
    const courseId = req.params.courseId;
    try {
      const { rating, review } = req.body;
      // make sure that the body will not be emptey
      if (!rating || !review)
        return next(new ErrorHandler("rating and review is required", 400));

      // validate the courseId
      const isValidCourseId = Types.ObjectId.isValid(courseId);
      if (!isValidCourseId)
        return next(new ErrorHandler("Please provide valid courseId", 400));

      const courseList = req.user.courses;
      const isCourseExist = courseList.find((course) => course.id === courseId);
      if (!isCourseExist)
        return next(
          new ErrorHandler(
            "Before giving review to this course, you have to buy this course.",
            400
          )
        );

      // find the course
      const course = await courseModel.findById(courseId);
      if (!course) return next(new ErrorHandler("course not found"));

      // review payload
      const reviewPayload = {
        user: {
          name: req?.user?.name,
          email: req?.user?.email,
          avatar: req?.user?.avatar,
          role: req?.user?.role,
          id: req?.user?._id,
        },
        rating,
        comment: review,
      };

      course.reviews.push(reviewPayload);

      // calculating the total reviews
      let avg = 0;
      course.reviews.forEach((review) => {
        avg += parseInt(review.rating);
      });

      // Calculating the avarage rating to thsi course
      course.rating = avg / course.reviews.length;

      // finaly save the course
      course.save();

      // nwo send the notification

      const notificaitonPayload = {
        title: "New Review",
        message: `You have a new review in ${course?.name}`,
        user: {
          name: req?.user?.name,
          email: req?.user?.email,
          avatar: req?.user?.avatar,
          role: req?.user?.role,
        },
      };
      const notification = await notificationService.create(
        notificaitonPayload
      );
      res.status(201).json({
        success: true,
        message: "Review added successfully",
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // Add review reply
  async addReviewReply(req, res, next) {
    const courseId = req.params.courseId;
    try {
      const { reply, reviewId } = req.body;
      // make sure that the body will not be emptey
      if (!reply || !reviewId)
        return next(new ErrorHandler("reply and reviewId is required", 400));

      // validate the courseId
      const isValidCourseId = Types.ObjectId.isValid(courseId);
      if (!isValidCourseId)
        return next(new ErrorHandler("Please provide valid courseId", 400));
      // validate the courseId
      const isValidReviewId = Types.ObjectId.isValid(reviewId);
      if (!isValidReviewId)
        return next(new ErrorHandler("Please provide valid reviewId", 400));

      // check that, is course exist?
      const courseList = req.user.courses;
      const isCourseExist = courseList.find((course) => course.id === courseId);
      if (!isCourseExist)
        return next(
          new ErrorHandler(
            "Before giving review to this course, you have to buy this course.",
            400
          )
        );

      // find the course
      const course = await courseModel.findById(courseId);
      if (!course) return next(new ErrorHandler("course not found"));

      let selectedReview;
      if (course.reviews.length > 1) {
        selectedReview = course.reviews.find((review) =>
          review._id.equals(reviewId)
        );
      } else {
        selectedReview = course.reviews[0];
      }

      // review payload
      const reviewReplyPayload = {
        user: {
          name: req?.user?.name,
          email: req?.user?.email,
          avatar: req?.user?.avatar,
          role: req?.user?.role,
          id: req?.user?._id,
        },
        comment: reply,
      };

      // adding reply into the selected review
      selectedReview.reviewReplies.push(reviewReplyPayload);

      // finaly save the course
      await course?.save();

      res.status(201).json({
        success: true,
        message: "Successfully replied to the review",
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }

  // delete course (this only for admin)
  async deleteCourse(req, res, next) {
    const {courseId} = req.body
    try {
      const isCourseExist = await courseService.findById(courseId)
      if(isCourseExist.error) return next(new ErrorHandler(isCourseExist.message, 400))

      // delete course
      const course = await courseService.delete(courseId)
      if(course.error) return next(new ErrorHandler(course.message, 400))

      // delete course from cache
      const isCourseCacheExist = await redis.get(courseId)
      if(isCourseCacheExist){
       await redis.del(courseId)
      }

      res.status(200).json({
        success:true, 
        message:"course deleted successfully"
      })
    } catch (error) {
      return next(new ErrorHandler(error.message))
    }
  }
}

module.exports = new CourseController();
