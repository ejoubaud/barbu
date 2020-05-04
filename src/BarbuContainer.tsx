import React from "react";

import { useBarbuStore, getMyHand } from "./barbuStore";
import MySimpleHand from "./MySimpleHand";

const BarbuContainer = () => {
  const myHand = useBarbuStore(getMyHand);
  return <MySimpleHand hand={myHand} />;
};

export default BarbuContainer;
