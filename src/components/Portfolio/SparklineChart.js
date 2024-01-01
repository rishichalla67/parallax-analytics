import React from "react";
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

const SparklineChart = ({ data }) => {
    return (
      <div>
        <Sparklines data={data} limit={data.length} width={100} height={50} margin={2}>
          <SparklinesLine style={{ fill: "none" }} />
          <SparklinesSpots />rea
        </Sparklines>
      </div>
    );
  };

export default SparklineChart;