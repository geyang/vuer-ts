import { createContext, PropsWithChildren, useContext } from 'react';
import { Helmet } from '@vuer-ai/react-helmet-async';
import { listName } from './index.module.scss';

const simpleContext = createContext({ value: false });
export const SimpleProvider = ({ children }: PropsWithChildren) => {
  return <simpleContext.Provider value={{ value: true }}>
    {children}
  </simpleContext.Provider>;

};

export const useSimple = () => {
  return useContext(simpleContext);
};
export const SimpleComponent = () => {

  const simple = useSimple();

  console.log('Simple:', simple);

  return <div>
    <Helmet>
      <title>Simple Helmet works</title>
    </Helmet>
    <h1 className={listName}>Simple Component</h1>
    <p>
      {simple?.value
        ? 'This is cool!'
        : 'context value did not load'}
    </p>
  </div>;
};