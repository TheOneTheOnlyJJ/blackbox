import { FC, useEffect } from "react";

const App: FC = () => {
  useEffect(() => {
    window.api.newUserStorage();
  }, []);

  return (
    <>
      <div>Hello, Electron with React and TypeScript!</div>
    </>
  );
};

export default App;
