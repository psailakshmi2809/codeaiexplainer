import { Redirect, Route } from 'react-router-dom';

interface ProtectedRouteProps {
  path: string;
  hasPermission: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, ...props }) => {
  const { path, hasPermission = false } = props;
  return hasPermission ? <Route path={path}>{children}</Route> : <Redirect to="/" />;
};
