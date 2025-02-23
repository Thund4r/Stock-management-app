import { useState } from "react";

const isPropNameAcceptable = (obj) => {
  const edittableAttributes = ["deliveryStatus"];
  const arrPropNames = Object.keys(obj);
  //assumes arrPropsNames is nonempty
  const validityOfEachPropName = arrPropNames.map((propName) => {
    for (const attribute of edittableAttributes) {
      if (propName === attribute) {
        return true;
      }
    }
    return false;
  });
  return !validityOfEachPropName.includes(false);
};

//Only expected to change deliveryStatus so we're just gonna hardcode some values since that's the easiest way to do it
const createUpdateObject = (orderToChange, AttributesToChangeObj) => {
  const newDelivStat = AttributesToChangeObj.deliveryStatus;
  const orderUpdateObj = {
    Update: {
      TableName: "OrderDB",
      Key: {
        orderID: orderToChange.toString(),
      },
      UpdateExpression: "SET #delivStat = :newStat",
      ExpressionAttributeNames: { "#delivStat": "deliveryStatus" }, //value is a reserved word in AWS SDK so we must use a placeholder to reference the value attribute in our table
      ExpressionAttributeValues: { ":newStat": newDelivStat },
      ConditionExpression: "attribute_exists(orderID)",
    },
  };
  const orderArchiveUpdateObj = {
    Update: {
      TableName: "OrderArchiveDB",
      Key: {
        orderID: orderToChange.toString(),
      },
      UpdateExpression: "SET #delivStat = :newStat",
      ExpressionAttributeNames: { "#delivStat": "deliveryStatus" }, //value is a reserved word in AWS SDK so we must use a placeholder to reference the value attribute in our table
      ExpressionAttributeValues: { ":newStat": newDelivStat },
      ConditionExpression: "attribute_exists(orderID)",
    },
  };
  return [orderUpdateObj, orderArchiveUpdateObj];
};

const fetchUpdatedData = async () => {
  let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
    method: "GET",
  });
  return response;
};

const feedbackValObject = {
  savePassed: 1,
  saveFailed: 2,
  resetPassed: 3,
  resetFailed: 4,
};

const displayFeedback = (feedbackVal) => {
  switch (feedbackVal) {
    case feedbackValObject.savePassed: {
      return <div>Data has been successfully updated and the new information has been loaded from the database.</div>;
    }
    case feedbackValObject.saveFailed: {
      return <div>Unable to update the data. Please ensure changes are made before trying again or an issues with the database update may have occured.</div>;
    }
    case feedbackValObject.resetPassed: {
      return <div>The table has been successfully reset to its default state.</div>;
    }
    case feedbackValObject.resetFailed: {
      return <div>No changes were made to the table, so there is nothing to reset.</div>;
    }
    default:
      return <div>feedbackVal didn't match any cases</div>;
  }
};

const calcSaveFeedbackVal = (isDatabaseUpdated) => {
  if (isDatabaseUpdated) {
    return feedbackValObject.savePassed;
  }
  return feedbackValObject.saveFailed;
};

export default function SaveChanges({ orderUpdates, setOrderUpdates, setIsOrdersTableReset, setliveOrders }) {
  const [feedbackVal, setFeedbackVal] = useState(false);
  const [isFeedbackAvailable, setIsFeedbackAvailable] = useState(false);

  const calcResetFeedbackVal = () => {
    const isOrderUpdatesEmpty = Array.from(orderUpdates).length === 0;
    if (!isOrderUpdatesEmpty) {
      return feedbackValObject.resetPassed;
    }
    return feedbackValObject.resetFailed;
  };

  const handleReset = () => {
    setOrderUpdates(new Map());
    setIsOrdersTableReset(true);
  };

  const handleSave = async () => {
    const updateDBObj = [];
    let itemsToUpdate = Array.from(orderUpdates);
    for (const [orderToChange, AttributesToChangeObj] of itemsToUpdate) {
      if (!isPropNameAcceptable(AttributesToChangeObj)) {
        alert("(Dev) internal issue when validating that all property names in AttributeToChangeObj match at least one attribute name from dynamoDB.");
        return;
      }
      const [orderUpdateObj, orderArchiveUpdateObj] = createUpdateObject(orderToChange, AttributesToChangeObj);
      updateDBObj.push(orderUpdateObj, orderArchiveUpdateObj);
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateDBObj),
    });
    return response;
  };

  return (
    <div>
      <button
        onClick={async () => {
          try {
            const isDatabaseUpdated = await handleSave();
            console.log(isDatabaseUpdated);
            if (!isDatabaseUpdated.ok) {
              console.log("ïnside not okay condition");
              setFeedbackVal(calcSaveFeedbackVal(isDatabaseUpdated.ok));
              return;
            }
            let updatedData = await fetchUpdatedData();
            updatedData = await updatedData.json();
            setliveOrders(updatedData.items);
            setFeedbackVal(calcSaveFeedbackVal(isDatabaseUpdated.ok));
            setIsFeedbackAvailable(true);
            handleReset();
          } catch (err) {
            console.log("an error occured while trying to update the DB and rerender the page:", err);
          }
        }}
      >
        Save Changes
      </button>
      <button
        onClick={() => {
          handleReset();
          setFeedbackVal(calcResetFeedbackVal());
          setIsFeedbackAvailable(true);
        }}
      >
        Remove Changes
      </button>
      {console.log("Rendering the buttons, here's feedbackVal:", feedbackVal)}
      {isFeedbackAvailable ? displayFeedback(feedbackVal) : null}
    </div>
  );
}
