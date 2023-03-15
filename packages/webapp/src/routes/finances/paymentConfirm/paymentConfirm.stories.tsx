import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import {
  paymentMethodFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';
import { append, times } from 'ramda';

import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../../shared/utils/storybook';
import { PaymentConfirm } from './paymentConfirm.component';

const Template: Story = () => {
  return <PaymentConfirm />;
};

export default {
  title: 'Routes/Finances/PaymentConfirm',
  component: PaymentConfirm,
  decorators: [
    withActiveSubscriptionContext,
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases(
          [
            subscriptionPhaseFactory({
              item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
            }),
          ],
          times(() => paymentMethodFactory(), 3)
        )
      ),
    }),
  ],
};

export const Default = Template.bind({});
Default.args = {};
