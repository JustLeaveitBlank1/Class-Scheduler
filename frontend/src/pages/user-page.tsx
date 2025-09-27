import { useUser } from '../authentication/use-auth'
import { Container } from 'semantic-ui-react'
export const UserPage = () => {
  const user = useUser();
  return (
    <Container>
    <div className="user-page-container">
      <span className="block">
        <h2>User Info</h2>
        <div>First Name : {user.firstName} </div>
        <div>Last Name : {user.lastName} </div>
        <div>User Name : {user.userName} </div>
        <div>&nbsp;</div>
        <div className="WhiteLine">&nbsp;</div>
      </span>
    </div>
    </Container>
  );
};
