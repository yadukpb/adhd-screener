import { el, mount } from "./dom";

export interface QuestionnaireItem {
  id: string;
  text: string;
}

/** Renders one item at a time with a labeled Likert button row; collects a 0..labels.length-1 response per item. */
export function runQuestionnaire(
  root: HTMLElement,
  title: string,
  subtitle: string,
  items: QuestionnaireItem[],
  labels: readonly string[],
  onComplete: (responses: number[]) => void,
): void {
  const responses: number[] = [];

  function renderItem(index: number) {
    if (index >= items.length) {
      onComplete(responses);
      return;
    }
    const item = items[index];
    const progress = el("div", { class: "progress" }, [`Question ${index + 1} of ${items.length}`]);
    const prompt = el("p", { class: "question-text" }, [item.text]);
    const choices = el(
      "div",
      { class: "choice-row" },
      labels.map((label, value) => {
        const b = el("button", { class: "btn choice" }, [label]);
        b.addEventListener("click", () => {
          responses[index] = value;
          renderItem(index + 1);
        });
        return b;
      }),
    );
    const back =
      index > 0
        ? (() => {
            const b = el("button", { class: "btn btn-secondary" }, ["Back"]);
            b.addEventListener("click", () => renderItem(index - 1));
            return b;
          })()
        : null;

    const screen = el("section", { class: "screen" }, [
      el("h2", {}, [title]),
      el("p", { class: "subtitle" }, [subtitle]),
      progress,
      prompt,
      choices,
      ...(back ? [back] : []),
    ]);
    mount(root, screen);
  }

  renderItem(0);
}
