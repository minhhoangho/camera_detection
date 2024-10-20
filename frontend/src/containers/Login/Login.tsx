import * as React from 'react';
import * as yup from 'yup';
import { useRouter } from 'next/router';

import { Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from 'react-query';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { FormInput } from 'src/components/Form/FormInput';
import { BaseLayout } from 'src/layouts';
import { toast } from 'src/components/Toast';
import styles from './Login.module.scss';
import { LoginPayloadRequest, LoginResponse } from './models';
import { login } from '../../api/auth';
import { PathName } from '../../constants/routes';
import CookiesStorage from '../../utils/cookie-storage';
import { CookieKey } from '../../constants';
import { userState } from '../../app-recoil/atoms/user';
import { UserData } from '../UserManagement/models';

export function Login() {
  const router = useRouter();
  const redirectUrl = router.query['redirectUrl'] as string;
  const [isLoading, setIsLoading] = useState(false);
  const setCurrentUser = useSetRecoilState(userState)


  const validationSchema = yup.object({
    email: yup.string().trim().email().required('Email is required'),
    password: yup.string().trim().min(6).required('Password is required'),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { mutate: loginMutate } = useMutation({
    mutationFn: (data: LoginPayloadRequest): Promise<LoginResponse> =>
      login(data),
    onSuccess: ({ accessToken, expirationTime, user }: LoginResponse) => {
      CookiesStorage.setCookieData(
        CookieKey.AccessToken,
        accessToken,
        expirationTime - 10,
      );
      CookiesStorage.setCookieData(
        CookieKey.UserInfo,
        user,
        expirationTime - 10,
      );

      setIsLoading(false);
      toast('success', 'Login sucessfully');
      setCurrentUser(user as UserData)

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(PathName.GisLocationManagement);
      }
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  // const handleLoginGoogle = () => {
  //   // eslint-disable-next-line no-console
  //   console.log('Handle login Google');
  // };

  const handleLogin = (data: Record<string, any>) => {
    loginMutate(data as LoginPayloadRequest);
  };
  return (
    <BaseLayout pageTitle="Login" isLoading={isLoading}>
      <div className={styles['wrapper']}>
        <div className={styles['login-box']}>
          <div className={styles['logo']}>
            <h1 className="text-5xl" onClick={() => router.replace('/')}>
              Đăng nhập
            </h1>
          </div>
          <div className={styles['email-password-block']}>
            <form
              className={styles['email-password-block']}
              onSubmit={handleSubmit(handleLogin)}
            >
              <FormInput
                control={control}
                name="email"
                inputElementClassName="form-control mr-sm-2"
                placeholder="Email"
                label="Email"
                labelClassName=""
                isRequired
              />
              <FormInput
                control={control}
                name="password"
                type="password"
                inputElementClassName="form-control mr-sm-2"
                placeholder="Password"
                label="Password"
                labelClassName="mt-5"
                isRequired
              />

              <div className="mt-5">
                <Button className={styles['submit-btn']} type="submit">
                  Sign in
                </Button>
              </div>
            </form>
          </div>
          {/*<div className="mt-3">*/}
          {/*  <p>*/}
          {/*    <span>Don&apos;t have account ?</span>*/}
          {/*    <span>*/}
          {/*      <a*/}
          {/*        onClick={() => router.replace('/register')}*/}
          {/*        className="cursor-pointer ml-1 text-blue-600"*/}
          {/*      >*/}
          {/*        Sign up now*/}
          {/*      </a>*/}
          {/*    </span>*/}
          {/*  </p>*/}
          {/*</div>*/}
        </div>
      </div>
    </BaseLayout>
  );
}
