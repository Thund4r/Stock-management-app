const factoryHttpRes = (statCode, success, message, error) => {
  return {
    statusCode: statCode,
    body: JSON.stringify({
      success: success,
      message: message,
      error: error,
    }),
  };
};

export const handler = async (event) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/api/revalidations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: event.body,
    });
    console.log(response);
    const responseBody = await response.json();
    console.log("Here's the response body:", responseBody);
    return {
      body: JSON.stringify({
        revalidated: "true",
      }),
    };
  } catch (err) {
    console.log("Error in revalidation serverless function:", err);
    return factoryHttpRes(400, "False", "Error occured in netlify revalidation API", "Internal server error");
  }
};
