import React from "react";

import { Trick as TrickType } from "./barbu";
import Trick from "./Trick";

type TricksProps = {
  tricks: TrickType[];
};

const Tricks = ({ tricks }: TricksProps) => {
  return (
    <>
      {tricks.map((trick, idx) => (
        <Trick trick={trick} key={idx} />
      ))}
    </>
  );
};

export default Tricks;
