import { useQuery } from '@apollo/client';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { Icon } from '@sb/webapp-core/components/icons';
import { isEmpty } from 'ramda';
import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';

import { ApiFormReturnType } from '../../../../hooks';
import { mapConnection } from '../../../../utils/graphql';
import { StripeCardForm } from '../stripeCardForm';
import { useStripePaymentMethods } from '../stripePayment.hooks';
import { StripePaymentMethodInfo } from '../stripePaymentMethodInfo';
import { stripeSubscriptionQuery } from './stripePaymentMethodSelector.graphql';
import {
  CardElementContainer,
  Container,
  DeleteButton,
  ErrorMessage,
  ExistingPaymentMethodItem,
  Heading,
  NewPaymentMethodItem,
  PaymentMethodList,
  PaymentMethodListItem,
} from './stripePaymentMethodSelector.styles';
import {
  PaymentFormFields,
  StripePaymentMethodSelection,
  StripePaymentMethodSelectionType,
} from './stripePaymentMethodSelector.types';
import { changeHandler, methodRemovedHandler } from './stripePaymentMethodSelector.utils';

export type StripePaymentMethodSelectorProps<T extends PaymentFormFields> = {
  formControls: ApiFormReturnType<T>;
  initialValueId?: string;
};

export const StripePaymentMethodSelector = <T extends PaymentFormFields>(
  props: StripePaymentMethodSelectorProps<T>
) => {
  const { data, loading } = useQuery(stripeSubscriptionQuery, {
    fetchPolicy: 'cache-and-network',
  });

  const {
    formControls: {
      form: {
        control,
        formState: { errors },
      },
      genericError,
      hasGenericErrorOnly,
    },
    initialValueId,
  } = props;
  const allPaymentMethods = data?.allPaymentMethods;

  const intl = useIntl();

  const paymentMethods = mapConnection((plan) => plan, allPaymentMethods);

  const { deletePaymentMethod } = useStripePaymentMethods();

  const defaultValue = useMemo<StripePaymentMethodSelection>(() => {
    if (isEmpty(paymentMethods)) {
      return {
        type: StripePaymentMethodSelectionType.NEW_CARD,
        data: {
          name: '',
          cardErrors: {},
          cardMissingFields: {},
        },
      };
    }

    const savedPaymentMethod = initialValueId && paymentMethods.find((method) => method.id === initialValueId);

    return {
      type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
      data: savedPaymentMethod || paymentMethods[0],
    };
  }, [paymentMethods, initialValueId]);

  if (loading)
    return (
      <span>
        <FormattedMessage defaultMessage="Loading..." id="Loading message" />
      </span>
    );

  return (
    <Controller<PaymentFormFields, 'paymentMethod'>
      name="paymentMethod"
      control={control as any}
      defaultValue={defaultValue}
      rules={{
        required: true,
        validate: (value) => {
          if (value.type !== StripePaymentMethodSelectionType.NEW_CARD) return true;

          const anyFieldMissing = Object.values(value.data.cardMissingFields ?? {}).some((isMissing) => isMissing);
          const fieldError = Object.values(value.data.cardErrors ?? {}).filter((error) => !!error)[0];

          if (fieldError) {
            return fieldError.message;
          }

          if (value.data === null || anyFieldMissing) {
            return intl.formatMessage({
              defaultMessage: 'Payment method is required',
              id: 'Stripe / Payment / Method required',
            });
          }

          if (!value.data.name) {
            return intl.formatMessage({
              defaultMessage: 'Card name is required',
              id: 'Stripe / Payment / Card name required',
            });
          }

          return true;
        },
      }}
      render={({ field: { onChange, value } }) => {
        const handleChange = changeHandler(onChange, value);
        const handleMethodRemoved = methodRemovedHandler(onChange, value, paymentMethods, deletePaymentMethod);

        return (
          <Container>
            <Heading>
              {isEmpty(paymentMethods) ? (
                <FormattedMessage
                  defaultMessage="Enter card details"
                  id="Stripe / payment method selector / enter card details"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Select payment method"
                  id="Stripe / payment method selector / select payment method"
                />
              )}
            </Heading>

            <PaymentMethodList>
              {paymentMethods.map((paymentMethod) => {
                const isSelected =
                  value.type === StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD &&
                  paymentMethod.id === value.data.id;

                return (
                  <PaymentMethodListItem key={paymentMethod.id}>
                    <ExistingPaymentMethodItem
                      checked={isSelected}
                      value={paymentMethod.id}
                      onChange={() => {
                        handleChange({
                          type: StripePaymentMethodSelectionType.SAVED_PAYMENT_METHOD,
                          data: paymentMethod,
                        });
                      }}
                    >
                      <StripePaymentMethodInfo method={paymentMethod} />
                      <DeleteButton
                        onClick={(e) => {
                          e.preventDefault();
                          if (paymentMethod.pk) {
                            handleMethodRemoved(paymentMethod.pk);
                          }
                        }}
                      >
                        <Icon size={16} icon={deleteIcon} />
                      </DeleteButton>
                    </ExistingPaymentMethodItem>
                  </PaymentMethodListItem>
                );
              })}

              {paymentMethods?.length > 0 && (
                <PaymentMethodListItem>
                  <NewPaymentMethodItem
                    type="button"
                    isSelected={value.type === StripePaymentMethodSelectionType.NEW_CARD}
                    onClick={() => {
                      handleChange({
                        type: StripePaymentMethodSelectionType.NEW_CARD,
                        data: null,
                      });
                    }}
                  >
                    <FormattedMessage
                      defaultMessage="Add a new card"
                      id="Stripe / payment method selector / new card option"
                    />
                  </NewPaymentMethodItem>
                </PaymentMethodListItem>
              )}
            </PaymentMethodList>

            {value?.type === StripePaymentMethodSelectionType.NEW_CARD && (
              <CardElementContainer>
                <StripeCardForm onChange={handleChange} />
              </CardElementContainer>
            )}

            <ErrorMessage>{errors.paymentMethod?.message?.toString()}</ErrorMessage>
            {hasGenericErrorOnly && <ErrorMessage>{genericError}</ErrorMessage>}
          </Container>
        );
      }}
    />
  );
};
