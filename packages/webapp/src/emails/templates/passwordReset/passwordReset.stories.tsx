import { Story } from '@storybook/react';

import { EmailStory } from '../../emailStory/emailStory.component';
import { EmailTemplateType } from '../../types';
import {
  Template as PasswordResetEmail,
  PasswordResetProps,
  Subject as PasswordResetSubject,
} from './passwordReset.component';

const Template: Story<PasswordResetProps> = (args: PasswordResetProps) => (
  <EmailStory type={EmailTemplateType.PASSWORD_RESET} subject={<PasswordResetSubject />} emailData={args}>
    <PasswordResetEmail {...args} />
  </EmailStory>
);

export default {
  title: 'Emails/PasswordReset',
  component: PasswordResetEmail,
};

export const Primary = Template.bind({});
Primary.args = {
  token: 'token-value',
  userId: 'user-id',
};
