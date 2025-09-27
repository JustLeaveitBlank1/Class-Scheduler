import axios from 'axios'
import { useMemo } from 'react'
import { ApiResponse } from '../constants/types'
import { Formik, Form, Field } from 'formik'
import { FormButton, FormInput} from 'semantic-ui-react'
import { useAsyncFn } from 'react-use'
import { Wrapper } from '../components/wrapper/wrapper'
import { loginUser } from '../authentication/authentication-services'
const baseUrl = process.env.REACT_APP_API_BASE_URL;
type LoginRequest = {
  userName: string;
  password: string;
};
type LoginResponse = ApiResponse<boolean>;
type FormValues = LoginRequest;
export const LoginPage = () => {
  const initialValues = useMemo<FormValues>(
    () => ({
      userName: "",
      password: "",
    }),
    []
  );
  const [, submitLogin] = useAsyncFn(async (values: LoginRequest) => {
    if (baseUrl === undefined) {
      return;
    }
    const response = await axios.post<LoginResponse>(
      `${baseUrl}/api/authenticate`,
      values
    );
    if (response.data.data) {
      console.log("Successfully Logged In!");
      loginUser();
    }
  }, []);
  return (
    <Wrapper>
      <div className="flex-box-centered-content-login-page">
        <div className="login-form">
          <Formik initialValues={initialValues} onSubmit={submitLogin}>
            <Form>
              <div>
                <div>
                  <div className="field-label">
                    <label htmlFor="userName">UserName</label>
                  </div>
                  <Field className="field" id="username" name="username">
                    {({field}:{field:object}) => <FormInput {...field} />}
                  </Field>
                </div>
                <div>
                  <div className="field-label">
                    <label htmlFor="password">Password</label>
                  </div>
                  <Field className="field" id="password" name="password">
                    {({field}:{field:object}) => <FormInput type="password" {...field} />}
                  </Field>
                </div>
                <div className="button-container-login-page">
                  <FormButton className="login-button" type="submit">
                    Login
                  </FormButton>
                </div>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </Wrapper>
  );
};
