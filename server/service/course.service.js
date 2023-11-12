const courseModel = require("../models/course.model");
class CourseService {
  /**
   *
   * @param {Object} courseData course data must be an object
   * @returns {{_id: String, name: String, description: String, price: Number, estimatedPrice: Number, tags: String, level: String, demoUrl: String, benifits: Array<{title: String, _id: String}>, prerequisites: Array<{title: String, _id: String}>, reviews: Array<{user: {name: String, email: String}, rating: Number, comment: String, _id: String}>, courseData: Array<{title: String, videoUrl: String, description: String, videoLength: Number, VideoPlayer: String, links: Array<{title: String, url: String, _id: String}>, suggestion: String, questions: Array<{user: {name: String, email: String}, comment: String, commentReplies: Array<{}>, _id: String}>, _id: String}>, ratings: Number, purchased: Number} | {error:Boolean, message:String}} it will return an object
   */
  async create(courseData) {
    try {
      if (Object.keys(courseData).length <= 0)
        return { error: true, message: "Course data can not be empty" };
      const course = await courseModel.create(courseData);
      if (!course)
        return { error: true, message: "Error to create the course" };

      return { data: course };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // find course data
  /**
   *
   * @param {String} courseId enter the course Id
   * @returns {{_id: String, name: String, description: String, price: Number, estimatedPrice: Number, tags: String, level: String, demoUrl: String, benifits: Array<{title: String, _id: String}>, prerequisites: Array<{title: String, _id: String}>, reviews: Array<{user: {name: String, email: String}, rating: Number, comment: String, _id: String}>, courseData: Array<{title: String, videoUrl: String, description: String, videoLength: Number, VideoPlayer: String, links: Array<{title: String, url: String, _id: String}>, suggestion: String, questions: Array<{user: {name: String, email: String}, comment: String, commentReplies: Array<{}>, _id: String}>, _id: String}>, ratings: Number, purchased: Number} | {error:Boolean, message:String}}
   */
  async find(courseId) {
    try {
      const courseData = await courseModel.findById(courseId);
      if (!courseData) return { error: true, message: "course data not found" };

      return courseData;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  // update course data

  /**
   *
   * @param {String} courseId enter the course Id
   * @param {Object} data please enter the course data
   * @returns {{_id: String, name: String, description: String, price: Number, estimatedPrice: Number, tags: String, level: String, demoUrl: String, benifits: Array<{title: String, _id: String}>, prerequisites: Array<{title: String, _id: String}>, reviews: Array<{user: {name: String, email: String}, rating: Number, comment: String, _id: String}>, courseData: Array<{title: String, videoUrl: String, description: String, videoLength: Number, VideoPlayer: String, links: Array<{title: String, url: String, _id: String}>, suggestion: String, questions: Array<{user: {name: String, email: String}, comment: String, commentReplies: Array<{}>, _id: String}>, _id: String}>, ratings: Number, purchased: Number} | {error:Boolean, message:String} }
   */
  async update(courseId, data) {
    try {
      const course = await courseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { new: true }
      );
      if (!course)
        return { error: true, message: "Error to update course data" };
      const updatedCourseData = await courseModel.findById(courseId);

      return updatedCourseData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // find course data by Id
  /**
   *
   * @param {String} courseId enter courseId
   * @param {String} selections enter select information
   * @returns {{_id: String, name: String, description: String, price: Number, estimatedPrice: Number, tags: String, level: String, demoUrl: String, benifits: Array<{title: String, _id: String}>, prerequisites: Array<{title: String, _id: String}>, reviews: Array<{user: {name: String, email: String}, rating: Number, comment: String, _id: String}>, courseData: Array<{title: String, videoUrl: String, description: String, videoLength: Number, VideoPlayer: String, links: Array<{title: String, url: String, _id: String}>, suggestion: String, questions: Array<{user: {name: String, email: String}, comment: String, commentReplies: Array<{}>, _id: String}>, _id: String}>, ratings: Number, purchased: Number} | {error:Boolean, message:String} }
   */
  async findById(courseId, selections) {
    try {
      let courseData;
      if (selections) {
        courseData = await courseModel.findById(courseId).select(selections);
      } else {
        courseData = await courseModel.findById(courseId);
      }
      if (!courseData) return { error: true, message: "Course data not found" };

      return courseData;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // find single course data
  /**
   *
   * @param {String} selections enter select information
   * @returns {{_id: String, name: String, description: String, price: Number, estimatedPrice: Number, tags: String, level: String, demoUrl: String, benifits: Array<{title: String, _id: String}>, prerequisites: Array<{title: String, _id: String}>, reviews: Array<{user: {name: String, email: String}, rating: Number, comment: String, _id: String}>, courseData: Array<{title: String, videoUrl: String, description: String, videoLength: Number, VideoPlayer: String, links: Array<{title: String, url: String, _id: String}>, suggestion: String, questions: Array<{user: {name: String, email: String}, comment: String, commentReplies: Array<{}>, _id: String}>, _id: String}>, ratings: Number, purchased: Number} | {error:Boolean, message:String} }
   */
  async find(selections) {
    try {
      let courseData;
      if (selections) {
        courseData = await courseModel.find({}).select(selections);
      } else {
        courseData = await courseData.find({});
      }
      if (!courseData) return { error: true, message: "Course data not found" };

      return courseData;
    } catch (error) {
      throw new Error(error.message);
    }
  }


}

module.exports = new CourseService();
