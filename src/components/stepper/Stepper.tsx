import React from 'react';
import { ChevronRight } from 'react-feather';

interface StepperProps {
  activeStep: number;
  stepLink: string;
  steps: string[];
}

const Stepper: React.FC<StepperProps> = (props) => {
  const getSteps = () => {
    const res = [];
    for (let i = 0; i < props.steps.length; i++) {
      const step = props.steps[i];
      if (i > 0) {
        res.push(
          <div key={'c-step' + i}>
            <ChevronRight size={'1.3rem'} strokeWidth={2.5} />
          </div>
        );
      }

      res.push(
        <div key={`step${i + 1}`} className="flex gap-2 align-middle">
          <div
            className={`rounded-full px-3 py-0.5 ${i + 1 === props.activeStep ? 'bg-blue-500' : `${i < props.activeStep ? 'bg-emerald-500' : 'bg-gray-300'}`
              } h-6 w-6 text-white text-center text-sm flex justify-center align-middle p-0.5`}
          >
            {i + 1}
          </div>
          <p className={`text-base font-semibold lg:block ${props.activeStep !== i ? 'hidden' : 'block'}`}>
            {step}
          </p>
        </div>
      );
    }
    return res;
  };

  return <div className="flex gap-4 py-4 align-middle overflow-x-scroll md:overflow-hidden whitespace-nowrap">{getSteps()}</div>;
};

export default Stepper;
