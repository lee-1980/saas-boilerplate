import { Input } from '@sb/webapp-core/components/forms';
import { FormattedMessage, useIntl } from 'react-intl';

import { useChangePasswordForm } from './changePasswordForm.hooks';
import { Container, ErrorMessage, FormFieldsRow, SubmitButton } from './changePasswordForm.styles';

export const ChangePasswordForm = () => {
  const intl = useIntl();

  const {
    form: {
      formState: { errors },
      register,
      getValues,
    },
    genericError,
    hasGenericErrorOnly,
    loading,
    handleChangePassword,
  } = useChangePasswordForm();

  return (
    <Container onSubmit={handleChangePassword}>
      <FormFieldsRow>
        <Input
          {...register('oldPassword', {
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'Old password is required',
                id: 'Auth / Change password / Old password required',
              }),
            },
          })}
          type="password"
          label={intl.formatMessage({
            defaultMessage: 'Old password',
            id: 'Auth / Change password / Old password placeholder',
          })}
          error={errors.oldPassword?.message}
        />
      </FormFieldsRow>

      <FormFieldsRow>
        <Input
          {...register('newPassword', {
            required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: 'New password is required',
                id: 'Auth / Change password / Password required',
              }),
            },
            minLength: {
              value: 8,
              message: intl.formatMessage({
                defaultMessage: 'Password is too short. It must contain at least 8 characters.',
                id: 'Auth / Change password / Password too short',
              }),
            },
          })}
          type="password"
          label={intl.formatMessage({
            defaultMessage: 'New password',
            id: 'Auth / Change password / New password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Minimum 8 characters',
            id: 'Auth / Change password / New password placeholder',
          })}
          error={errors.newPassword?.message}
        />
      </FormFieldsRow>

      <FormFieldsRow>
        <Input
          {...register('confirmNewPassword', {
            validate: {
              required: (value) =>
                value?.length > 0 ||
                intl.formatMessage({
                  defaultMessage: 'Confirm password is required',
                  id: 'Auth / Change password / Confirm password required',
                }),
              mustMatch: (value) =>
                getValues().newPassword === value ||
                intl.formatMessage({
                  defaultMessage: 'Passwords must match',
                  id: 'Auth / Change password / Password must match',
                }),
            },
          })}
          type="password"
          label={intl.formatMessage({
            defaultMessage: 'Confirm new password',
            id: 'Auth / Change password / Confirm new password label',
          })}
          placeholder={intl.formatMessage({
            defaultMessage: 'Minimum 8 characters',
            id: 'Auth / Change password / Confirm new password placeholder',
          })}
          error={errors.confirmNewPassword?.message}
        />
      </FormFieldsRow>
      {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}

      <SubmitButton disabled={loading}>
        <FormattedMessage defaultMessage="Change password" id="Auth / Change password / Submit button" />
      </SubmitButton>
    </Container>
  );
};
