import { Controller, Post, Req, Param, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { RawBodyRequest } from '@nestjs/common/interfaces';
import { Public } from '../common/decorators/public.decorator';
import { PaymentService } from './payment.service';
import { PaymentProviderType } from './interfaces/payment-provider.interface';

@Controller('payment/webhooks')
export class WebhooksController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':provider')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body required for webhook signature verification');
    }
    const normalizedProvider = provider.toLowerCase() as PaymentProviderType;
    if (normalizedProvider !== 'paypal' && normalizedProvider !== 'mercadopago') {
      throw new BadRequestException('Unknown webhook provider');
    }
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === 'string') headers[k] = v;
      else if (Array.isArray(v) && v[0]) headers[k] = v[0];
    }
    const result = await this.paymentService.handleWebhook(
      normalizedProvider,
      rawBody,
      headers,
    );
    return { processed: result.processed };
  }
}
