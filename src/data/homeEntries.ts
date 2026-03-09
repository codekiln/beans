import { getBeans, type BeanEntry } from "./beans";
import { getQuestionPath, getQuestions, type QuestionEntry } from "./questions";

type HomeEntryBase = {
  href: string;
  cliLog: string;
  sortDate: string;
  sortTime: string;
  sortSlug: string;
};

export type HomeBeanEntry = HomeEntryBase & {
  kind: "bean";
  bean: BeanEntry;
};

export type HomeQuestionEntry = HomeEntryBase & {
  kind: "question";
  question: QuestionEntry;
};

export type HomeEntry = HomeBeanEntry | HomeQuestionEntry;

const compareHomeEntries = (a: HomeEntry, b: HomeEntry) => {
  const dateCompare = b.sortDate.localeCompare(a.sortDate);
  if (dateCompare !== 0) return dateCompare;

  const timeCompare = b.sortTime.localeCompare(a.sortTime);
  if (timeCompare !== 0) return timeCompare;

  const kindCompare = a.kind.localeCompare(b.kind);
  if (kindCompare !== 0) return kindCompare;

  return a.sortSlug.localeCompare(b.sortSlug);
};

export const getHomeEntries = async () => {
  const [beans, questions] = await Promise.all([getBeans(), getQuestions()]);
  const entries: HomeEntry[] = [
    ...beans.map(
      (bean): HomeBeanEntry => ({
        kind: "bean",
        bean,
        href: `/log/${bean.slug}/`,
        cliLog: `log ${bean.data.date} ${bean.data.beanKey}`,
        sortDate: bean.data.date,
        sortTime: bean.data.time ?? "",
        sortSlug: bean.slug
      })
    ),
    ...questions.map(
      (question): HomeQuestionEntry => ({
        kind: "question",
        question,
        href: getQuestionPath(question.slug),
        cliLog: `question ${question.slug}`,
        sortDate: question.data.dateCreated,
        sortTime: "",
        sortSlug: question.slug
      })
    )
  ];

  return entries.sort(compareHomeEntries);
};
