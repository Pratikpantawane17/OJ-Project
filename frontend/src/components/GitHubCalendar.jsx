import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import '../GitHubCalendar.css';
import "react-calendar-heatmap/dist/styles.css";
import { subYears, format, parseISO } from "date-fns";

export default function GitHubCalendar({ submissions }) {
  // 1) filter out anything missing a date
  const valid = submissions.filter(s => !!s.dateSolved);

  // 2) parse & format each date
  const values = valid.map(({ dateSolved, count }) => {
    // parseISO will correctly handle "YYYY-MM-DD" or full ISO strings
    const dt = parseISO(dateSolved);
    return {
      date:  format(dt, "yyyy-MM-dd"),
      count
    };
  });

  return (
    <CalendarHeatmap
      startDate={subYears(new Date(), 1)}
      endDate={new Date()}
      values={values}
      gutterSize={2}       // tighter spacing
      squareSize={20}      // smaller squares
      classForValue={v => {
        if (!v) return "color-empty";
        if (v.count >= 4) return "color-github-4";
        if (v.count >= 2) return "color-github-3";
        return "color-github-2";
      }}
      tooltipDataAttrs={v => ({
        "data-tip": `${v.date}: ${v.count} submission${v.count !== 1 ? "s" : ""}`,
      })}
      // showWeekdayLabels
    />
  );
}
