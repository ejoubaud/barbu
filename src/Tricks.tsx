import React from "react";

import { Trick as TrickType } from "./barbu";
import Trick from "./Trick";

type TricksProps = {
  tricks: TrickType[];
  showLast: boolean;
};

const Tricks = ({ tricks, showLast }: TricksProps) => {
  const last = tricks.length - 1;
  const hiddenTricks = showLast ? tricks.slice(0, -1) : tricks;
  return (
    <>
      {hiddenTricks.map((trick, idx) => (
        <Trick trick={trick} key={idx} />
      ))}
      {showLast && tricks[last] && <Trick trick={tricks[last]} key={last} isVisible />}
    </>
  );
};

export default Tricks;
