export default async function handler(req, res) {
  try {

    if (req.headers["content-type"] != "application/json") {
      return res.status(500).json({
        success: "False",
        message: "Expected application/json",
        error: "True, Incorrect content/type value in header",
      });
    }
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: "False",
        message: "Expected an array",
        error: "True, non array object in request body",
      });
    }
    if (req.body.length === 0) {
      return res.status(400).json({
        success: "False",
        message: "Expected non empty array",
        error: "True, Path is empty",
      });
    }
    console.log("About to execute revalidation in nextJS API");
    for (const path of req.body) {
      console.log("The path i am revalidating is:", path);
      await res.revalidate(path);
      console.log("succesfully revalidated path:", path);
    }
    return res.json({ revalidated: true });
  } catch (err) {
    console.log("Error in nextJS revalidation API:", err);
    res.status(400).json("An error occured during nextJS revalidation");
  }
}
