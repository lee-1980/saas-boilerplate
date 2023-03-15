import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { Story } from '@storybook/react';

import { fillSubscriptionPlansAllQuery, fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withActiveSubscriptionContext, withProviders } from '../../../shared/utils/storybook';
import { EditSubscription } from './editSubscription.component';

const Template: Story = () => {
  return <EditSubscription />;
};

export default {
  title: 'Shared/Subscriptions/EditSubscription',
  component: EditSubscription,
};

const mockMonthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  pk: 'plan_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
});
const mockYearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

export const FreeActive = Template.bind({});
FreeActive.args = { children: 'text' };
FreeActive.decorators = [
  withActiveSubscriptionContext,
  withProviders({
    apolloMocks: (defaultMocks) =>
      defaultMocks.concat([
        fillSubscriptionPlansAllQuery([mockMonthlyPlan, mockYearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
          }),
        ]),
      ]),
  }),
];

export const MonthlyActive = Template.bind({});
MonthlyActive.args = { children: 'text' };
MonthlyActive.decorators = [
  withActiveSubscriptionContext,
  withProviders({
    apolloMocks: (defaultMocks) =>
      defaultMocks.concat([
        fillSubscriptionPlansAllQuery([mockMonthlyPlan, mockYearlyPlan]),
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: { price: subscriptionPlanFactory() },
          }),
        ]),
      ]),
  }),
];
