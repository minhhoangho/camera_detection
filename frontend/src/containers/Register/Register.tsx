import * as React from 'react';
import { useRouter } from 'next/router';
import * as yup from 'yup';

import { Button } from '@mui/material';
import { ArrowLeftOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styles from './Register.module.scss';
import { BaseLayout } from '../../layouts';
import { FormInput } from 'src/components/Form';

const validationSchema = yup.object({
  email: yup.string().trim().required('Email is required'),
  password: yup.string().trim().required('Email is required'),
});
export function Register() {
  const router = useRouter();
  const { control } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const handleRegister = () => {
    // eslint-disable-next-line no-console
    console.log('Handle register');
    router.push('/home');
  };

  return (
    <BaseLayout pageTitle="Register">
      <div className={styles['wrapper']}>
        <div className={styles['login-box']}>
          <div className={styles['logo']}>
            <h1 className="text-5xl" onClick={() => router.replace('/')}>
              Register Page
            </h1>
          </div>

          <div className={styles['email-password-block']}>
            <form
              className={styles['email-password-block']}
              onSubmit={handleRegister}
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
                inputElementClassName="form-control mr-sm-2"
                placeholder="Password"
                label="Password"
                labelClassName="mt-5"
                isRequired
              />
              <FormInput
                control={control}
                name="confirmPassword"
                inputElementClassName="form-control mr-sm-2"
                placeholder="Confirm your password"
                label="Confirm your password"
                labelClassName="mt-5"
                isRequired
              />
              <div className="mt-6">
                <Button className={styles['submit-btn']}>Sign up</Button>
              </div>
            </form>

            <div className="mt-3">
              <div className="cursor-pointer flex items-center">
                <span className="mr-1">
                  <ArrowLeftOutlined />
                </span>
                <span style={{ fontFamily: 'roboto', fontSize: 14 }}>
                  <a onClick={() => router.replace('/login')}>
                    Back to sign in
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
