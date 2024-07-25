import { FC } from "react";

const App: FC = () => {
  return (
    <>
      <button
        onClick={() => {
          console.log("Clicked button!");
          window.api.newUserStorage();
          console.log("Event sent!");
        }}
      >
        New User Storage
      </button>
      <div>Hello, Electron with React and TypeScript!</div>
    </>
  );
};

export default App;
