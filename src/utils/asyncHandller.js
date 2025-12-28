// Using this we can handle the async errors

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;

// Using this we can handle the async errors by using the try catch block

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {} // Handle the funciton in by using the higher order function
// const asyncHandler = (func) => async() => {}   //  Handling higher order function by using async function

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next)
//   } catch (error) {
//     res.send(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
