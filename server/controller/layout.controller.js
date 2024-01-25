// models
const layoutModel = require("../models/layout.model");
// utils libraries
const { formidable } = require("formidable");
// utils functions
const ErrorHandler = require("../utils/errorHandler");
// services
const imageService = require("../service/imageUpload.service");

class LayoutController {
  async create(req, res, next) {
    try {
      const { type } = req.body;

      if (!type) {
        const form = formidable({});
        try {
          form.parse(req, async (err, fields, files) => {
            const { bannerImg } = files;
            const { title, subTitle, type } = fields;

            const layoutType = type[0] || type;
            const layoutTitle = title[0] || title;
            let layoutSbuTitle;
            if (subTitle) layoutSbuTitle = subTitle[0] || subTitle;
            
            if (layoutType.toLowerCase() === "banner") {

              if (!bannerImg)
                return next(new ErrorHandler("please select an image", 400));

              if (!title)
                return next(
                  new ErrorHandler("Please give a title of this image", 400)
                );

              // uploading the image to cloudinary
              const image = await imageService.upload(bannerImg[0], "layout");

              if (image.error)
                return next(new ErrorHandler(image.message, 400));

              const banner = {
                image,
                title: layoutTitle,
                subTitle: layoutSbuTitle,
              };

              const bannerUpload = await layoutModel.create({
                type: "banner",
                banner,
              });
              if (!bannerUpload)
                return next(
                  new ErrorHandler(
                    { error: bannerUpload, txt: "Error to upload banner" },
                    500
                  )
                );
              res.status(201).json({
                success: true,
                message: "Layout created successfully",
              });
            }
          });
        } catch (error) {
          return next(new ErrorHandler(error.message, 500));
        }
      } else {
        if (!type) return next(new ErrorHandler("please define the type", 400));
        const isTypeExist = await layoutModel.findOne({ type });
        if (isTypeExist)
          return next(new ErrorHandler(`${type} already exists`, 400));

        if (type.toLowerCase() === "faq") {
          const { faq } = req.body;
          if (!faq)
            return next(new ErrorHandler("please provide FAQ data", 400));
          if (faq.length <= 0)
            return next(new ErrorHandler("FAQ data can not be empty", 400));
          const faqItems = await Promise.all(
            faq.map((item) => {
              return {
                question: item.question,
                answer: item.answer,
              };
            })
          );

          await layoutModel.create({
            type,
            faq: faqItems,
          });

          res.status(201).json({
            success: true,
            message: "Layout created successfully",
          });
        }

        if (type.toLowerCase() === "category") {
          const { categories } = req.body;
          try {
            if (!categories)
              return next(
                new ErrorHandler("please provide categories data", 400)
              );
            if (categories.length <= 0)
              return next(
                new ErrorHandler("Categories data can not be empty", 400)
              );

            const categoryItems = await Promise.all(
              categories.map((category) => {
                return {
                  title: category.title,
                };
              })
            );

            const categoryUpload = await layoutModel.create({
              type: "category",
              categories: categoryItems,
            });
            if (!categoryUpload)
              return next(
                new ErrorHandler(
                  { error: categoryUpload, txt: "Error to upload categories" },
                  500
                )
              );
            res.status(201).json({
              success: true,
              message: "Layout created successfully",
            });
          } catch (error) {}
        }
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
}

module.exports = new LayoutController();
