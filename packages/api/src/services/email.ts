export interface EmailReplyPayload {
	to: string;
	subject: string;
	body: string;
	threadId?: string | null;
	messageId?: string | null;
}

export interface EmailDeliveryResult {
	delivered: boolean;
	externalMessageId?: string;
}

export interface EmailDeliveryAdapter {
	sendReply(payload: EmailReplyPayload): Promise<EmailDeliveryResult>;
}

class StubEmailDeliveryAdapter implements EmailDeliveryAdapter {
	async sendReply(_payload: EmailReplyPayload): Promise<EmailDeliveryResult> {
		return {
			delivered: false,
		};
	}
}

export const emailDeliveryAdapter: EmailDeliveryAdapter =
	new StubEmailDeliveryAdapter();
