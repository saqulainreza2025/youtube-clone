//First way using try and catch
// const asyncHandler1 = (fn) => {
//   return async (req, res, next) => {
//     try {
//       await fn(req, res, next); // Calls your actual route logic
//     } catch (error) {
//       res.status(error.code || 500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
// };

// //
// //
//Secons way using Promises
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
