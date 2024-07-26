import { FC, useEffect } from "react";

const App: FC = () => {
  useEffect(() => {
    console.log("Emitting new user storage request to main process.");
    window.api.newUserStorage();
  }, []);

  return (
    <>
      <div>Hello, Electron with React and TypeScript!</div>
    </>
  );
};

export default App;
