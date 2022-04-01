import { setgroups } from "process";
import React, { useEffect, useRef, useState } from "react";

interface StepperProps {
  activeStep: number;
  steps: string[];
}

const Stepper: React.FC<StepperProps> = (props) => {
 
  const getSteps = () => {
    const res = [];
    for(let i=0 ; i<props.steps.length ; i++) {
      const step = props.steps[i];
      
      const classes = ["step"];
      
      if(i < props.activeStep) classes.push("done");
      else if(i === props.activeStep) classes.push("active");

      if(i > 0) {
        const sepClasses = ["separator"];
        if(i <= props.activeStep) sepClasses.push("done");
        res.push(<div key={"sep" + i} className={sepClasses.join(" ")}></div>)
      }

      res.push(<div key={"step" + i} className={classes.join(" ")}> 
        <p className="circle">{i < props.activeStep ? "✓" : i+1}</p>
        <p className="label" key={step}>{step}</p>
      </div>);
    }
    return res;
  }

  return (<div className="stepper">{getSteps()}</div>);
}

export default Stepper;