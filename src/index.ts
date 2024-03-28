import { Flow, JSONRPCResponse } from "flow-launcher-helper";
import ms from "ms";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import childProcess from "child_process";
import * as chrono from "chrono-node";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

const copy = (content: string) => childProcess.spawn("clip").stdin.end(content);

type Methods = "copy_result";

const { params, on, showResult, run } = new Flow("icon.png");

on("query", () => {
  let date: dayjs.Dayjs = dayjs();

  // Use chrono
  if (params.length > 0) {
    const timestamp = chrono.parseDate(params);
    date = dayjs(timestamp);
  }

  if (date.isValid()) {
    showResult(...getResults(date));
    return;
  }

  // Parse through ms
  date = dayjs(new Date(Date.now() + ms(params)));

  if (date.isValid()) {
    showResult(...getResults(date));
    return;
  }

  showResult({
    title: "Invalid input",
  });
});

function getResults(date: dayjs.Dayjs): JSONRPCResponse<Methods>[] {
  // My own function for a better relative timepoint output (e.g., "in 2 days 3 hours 5 minutes")
function formatTimeFromNow(date: dayjs.Dayjs): string {
    const diffMinutes: number = Math.abs(Math.round(date.diff(dayjs(), 'minute', true))); // Absolute and rounded time difference in minutes

    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }

    const diffHours: number = Math.floor(diffMinutes / 60);
    const remainingMinutes: number = diffMinutes % 60;
    const diffDays: number = Math.floor(diffHours / 24);
    const diffMonths: number = Math.abs(date.diff(dayjs(), 'month')); // Absolute difference in months
    const diffYears: number = Math.floor(diffMonths / 12);

    let result: string = '';

    if (diffDays > 0) {
        result += `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        if (diffHours % 24 > 0 || remainingMinutes > 0) {
            result += ' ';
        }
    }

    if (diffHours % 24 > 0) {
        result += `${diffHours % 24} hour${(diffHours % 24) !== 1 ? 's' : ''}`;
        if (remainingMinutes > 0) {
            result += ' ';
        }
    }

    if (remainingMinutes > 0) {
        result += `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }

    if (diffYears > 0 || diffMonths > 0) {
        result += `; ca. ${diffYears > 0 ? diffYears + ' year' + (diffYears !== 1 ? 's' : '') : ''}`;
        if (diffMonths > 0) {
            const totalMonths: number = Math.floor(diffMonths) + Math.round((diffMonths % 1) * 10) / 10;
            result += `${diffYears > 0 ? ' or ' : ''}${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
        }
    }

    return result.trim();
}


return [
    {
        title: date.format("DD/MM/YY"),
        subtitle: "<DD/MM/YY>",
        method: "copy_result",
        params: [date.format("DD/MM/YY")],
    },
    {
        title: date.format("dddd, DD.MM"),
        subtitle: "<dddd, DD.MM>",
        method: "copy_result",
        params: [date.format("dddd, DD.MM")],
    },
    {
        title: date.format("dddd, DD.MM HH:mm"),
        subtitle: "<dddd, DD.MM HH:mm>",
        method: "copy_result",
        params: [date.format("dddd, DD.MM HH:mm")],
    },
    {
        title: `in ${date.fromNow(true)}`,
        subtitle: `in <time>`,
        method: "copy_result",
        params: [`in ${date.fromNow(true)}`],
    },
    {
        title: `in ${formatTimeFromNow(date)}`,
        subtitle: `Accurately, in <time>`,
        method: "copy_result",
        params: [`in ${formatTimeFromNow(date)}`],
    },
    {
        title: date.format("dddd, MMMM DD"),
        subtitle: "<dddd, MMMM DD>",
        method: "copy_result",
        params: [date.format("dddd, MMMM DD")],
    },
    {
        title: date.format("dddd, MMMM DD HH:mm"),
        subtitle: "<dddd, MMMM DD HH:mm>",
        method: "copy_result",
        params: [date.format("dddd, MMMM DD HH:mm")],
    },
    {
        title: date.format("dddd, MMMM DD, YYYY HH:mm"),
        subtitle: "<dddd, MMMM DD, YYYY HH:mm>",
        method: "copy_result",
        params: [date.format("dddd, MMMM DD, YYYY HH:mm")],
    },
    {
        title: date.format("LLLL"),
        subtitle: `Unix Format: <t:${date.unix()}:F> `,
        method: "copy_result",
        params: [`<t:${date.unix()}:F>`],
    },
    /** Original "Discord Timestamps" plugin code  by Jesse, for output in the Unix dateformat. Uncomment if you want to use it.
    {
        title: date.format("L"),
        subtitle: `<t:${date.unix()}:d>`,
        method: "copy_result",
        params: [`<t:${date.unix()}:d>`],
    },
    {
        title: date.format("LL"),
        subtitle: `<t:${date.unix()}:D>`,
        method: "copy_result",
        params: [`<t:${date.unix()}:D>`],
    },
    {
        title: date.format("LT"),
        subtitle: `<t:${date.unix()}:t>`,
        method: "copy_result",
        params: [`<t:${date.unix()}:t>`],
    },
    {
        title: date.format("LTS"),
        subtitle: `<t:${date.unix()}:T>`,
        method: "copy_result",
        params: [`<t:${date.unix()}:T>`],
    },
    {
        title: date.format("LLL"),
        subtitle: `<t:${date.unix()}:f>`,
        method: "copy_result",
        params: [`<t:${date.unix()}:f>`],
    },
    {
        title: date.format("LLLL"),
        subtitle: `<t:${date.unix()}:F>`,
        method: "copy_result",
        params: [`<t:${date.unix()}:F>`],
    },
    {
        title: date.fromNow(),
        subtitle: `<t:${date.unix()}:R>`,
        method: "copy_result",
        params: [`<t:${date.unix()}:R>`],
    },
    {
        title: date.unix().toString(),
        subtitle: date.unix().toString(),
        method: "copy_result",
        params: [date.unix().toString()],
    },
/**/
];
}
on("copy_result", () => {
copy(params);
});
run();