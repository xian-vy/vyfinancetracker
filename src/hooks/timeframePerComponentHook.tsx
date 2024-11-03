import { useEffect, useState } from "react";
import { COMPONENTS_WITH_TIMEFRAME } from "../constants/constants";
import { FilterTimeframe } from "../constants/timeframes";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface Props {
    component : COMPONENTS_WITH_TIMEFRAME | undefined
}

export const useTimeframePerComponent = ({  component }: Props) => {
    //Set default timeframe for each component that has filter by timeframe
    
   const defaultGlobalTimeframe = useSelector((state: RootState) => state.timeframe.value);
   const  [defaultTimeframe, setDefaultTimeframe] = useState<FilterTimeframe>(defaultGlobalTimeframe);
    
   useEffect(() => {
     if (component) {
         const prevTimeframe = localStorage.getItem(component + "_defaultTimeframe");
         if (prevTimeframe ) {
            localStorage.setItem(component + "_defaultTimeframe", prevTimeframe);
            setDefaultTimeframe(prevTimeframe as FilterTimeframe);
         } else {
            localStorage.setItem(component + "_defaultTimeframe", defaultGlobalTimeframe);
            setDefaultTimeframe(defaultGlobalTimeframe);
         }
     }
   }, [defaultGlobalTimeframe])

   return  defaultTimeframe

};
