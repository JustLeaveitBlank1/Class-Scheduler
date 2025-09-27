import React from 'react'
import { Container } from 'semantic-ui-react'
export const AddUserPage = () => {
  return (
    <div className="add-user-page-container">
      <Container>
        <h1>This page is going to create new users.</h1>
            <h2>First name: </h2>
            <h2>Last name: </h2>
            <h2>email: </h2>
        </Container> 
    </div>
  );
};