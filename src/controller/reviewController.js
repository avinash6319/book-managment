
const reviewModel = require('../model/reviewModel')
const bookModel = require('../model/bookModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString, validateName,validateRating } = require('../validator/validator')
const{isValidObjectId}=require("mongoose")

const createReview = async (req, res) => {
    try {

        let BookId = req.params.bookId
        let data = req.body

        let { review, rating, reviewedBy, ...rest } = data

        
        if (!isValidObjectId(BookId)) { return res.status(400).send({ status: false, message: `This BookId: ${BookId} is not Valid.` }) }

        if (!checkInputsPresent(data)) { return res.status(400).send({ status: false, message: "Please Provide Details to Create Review." }) }
        if (!checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You have to put only review & rating & reviewedBy,." }) }

    
        let checkBookId = await bookModel.findOne({ _id: BookId, isDeleted: false })
        if (!checkBookId) { return res.status(400).send({ status: false, message: `Book with this ${BookId} is not Exist or already been deleted.` }) }

        if (data.hasOwnProperty('reviewedBy')) {
            if (!checkString(reviewedBy) || !validateName(reviewedBy)) return res.status(400).send({ status: false, message: "Please Provide Valid Name in reviewedBy or Delete the key()." });
        }

        if (data.hasOwnProperty('review')) {
            if (!checkString(review) || !validateName(review)) return res.status(400).send({ status: false, message: "Please Provide Valid Review." });
        }

       
        if (data.hasOwnProperty('rating')) {
            if ((typeof rating !== "number") || (rating === 0) || !(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, message: "Please enter valid rating (number) in between range (1 to 5)." });
            }
        }

        if (!rating) { return res.status(400).send({ status: false, message: "Please enter Book rating(required)" }) }

        data.bookId = BookId
        data.reviewedAt = Date.now()

        let createReview = await reviewModel.create(data)

        let updateBookData = await bookModel.findByIdAndUpdate({ _id: BookId }, { $inc: { reviews: 1 } }, { new: true })

        let details = {
            _id: createReview._id,
            bookId: BookId,
            reviewedBy: createReview.reviewedBy,
            reviewedAt: createReview.reviewedAt,
            rating: createReview.rating,
            review: createReview.review
        }

        updateBookData._doc.reviewData = details

        res.status(201).send({ status: true, message: "Success", data: updateBookData })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}

const updateReview = async function (req, res) {
    try {
        const requestBody = req.body
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "invalid book id" })
    
        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "userId not valid" })
        }
        const book = await bookModel.findOne({ _id: bookId, isDeleted: false });
        if (!book) {
            return res.status(400).send({ status: false, message: "book not found" })
            
        }
        if (!checkInputsPresent(data)) {
            return res.status(400).send({ status: false, msg: "please provide some data to update review" })
        }
    
         let Obj1={}
    
             
            if(reviewedBy){
                if (!validateName(reviewedBy)) {
                    return res.status(400).send({ status: false, msg: "reviewerName should be in proper format" })
                }
                 if(!validateName(reviewedBy))
                 return res.status(400).send({ status: false, msg: "reviewerName is invalid" })
               
                    Obj1.reviewedBy=reviewedBy
            }
          
      
        if (!rating) {
            return res.status(400).send({ status: false, msg: "rating is required" })
        }
        if (Obj1.hasOwnProperty('rating')) {
            if ((typeof rating === "number") || (rating === 0) || !(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, message: "Please enter valid rating (number) in between range (1 to 5)." });
            }
        }
        // if (rating){
    
        // if(!(typeof rating ==="number")){
        //   return res.status(400).send({status:false, msg:"rating should be a number"})
        // }
          if (!validateRating(rating))
          return res.status(400).send({status:false, msg:"rating should be between 1 to 5"})
    
    
        
        const updateReview = await reviewModel.findOneAndUpdate(fetchReview, updatedReviewData, { new: true })

        data['reviewsData'] = updateReview

        return res.status(200).send({ status: true, message: 'review updated successfully', data: data });

    } catch (err) {
        return res.status(500).send({ status: false, message: e.message })
    }
    }

// =================================delete review========================================

const deletereview= async function(req,res){
try{
    let bookId=req.params.bookId
    if(!isValidObjectId(bookId)) return res.status(400).send({status:false,messgage:"Please Provide valid BookId"})

    let reviewId=req.params.reviewId
    if(!isValidObjectId(reviewId)) return res.status(400).send({status:false,message:"Please Provide valid review Id"})

    const checkbook= await bookModel.findById({_id:bookId})
    if(!checkbook) return res.status(404).send({status:false,message:"No Book exist with this Id"})
    if(checkbook.isDeleted) return res.status(200).send({status:false,message:"Book Already deleted"})

    if(checkbook.reviews==0) return res.status(200).send({status:true,message:"No reviews till now"})

    const checkreview= await reviewModel.findById({_id:reviewId})
    if(!checkreview) return res.status(404).send({status:false,message:"No reviews with this Id"})
    if(checkreview.bookId.toString()!==bookId) return res.status(404).send({status:false,message:"Review is not present with this id in this book"})
    if(checkreview.isDeleted) return res.status(200).send({status:false,message:"Review is already deleted"})

    const deletereviewdata= await reviewModel.findOneAndUpdate(
        {_id:reviewId},
        {$set:{isDeleted:true}});

    const countreview= await bookModel.findOneAndUpdate(
        {_id:bookId},
        { $inc: { reviews: -1 } })

    return res.status(200).send({status:true,message:"Review deleted Successfully"})
}catch(error){
    return res.status(500).send({status:false,message:error.message})
}
}


module.exports={createReview,deletereview,updateReview}