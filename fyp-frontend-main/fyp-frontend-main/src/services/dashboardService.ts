export const getUserProjects = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          projects: [
            { id: "1", name: "Project Alpha" },
            { id: "2", name: "Project Beta" },
          ],
          recents: [
            { id: "3", name: "Recent Workflow 1" },
            { id: "4", name: "Recent Workflow 2" },
          ],
        });
      }, 1000);
    });
  };
  