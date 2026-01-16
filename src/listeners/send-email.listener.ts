import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument = require('pdfkit');
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import { PaymentConfirmedEvent } from '../payments/events/payment-confirmed.event';
import { Payment } from '../payments/payment.entity';
import { PaymentReceipt } from '../payments/payment-receipt';

@Injectable()
export class SendEmailListener {
  private readonly logger = new Logger(SendEmailListener.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) { }

  @OnEvent('payment.confirmed')
  async handlePaymentConfirmed(event: PaymentConfirmedEvent) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    if (!host || !user || !pass || !from) {
      this.logger.error('SMTP config missing; email not sent');
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const { receipt } = event;
      const amountLine = `${receipt.amount} ${receipt.currency}`;
      const html = `
        <div style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1b1f24;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e8ec;">
                  <tr>
                    <td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a,#1f2937);color:#ffffff;">
                      <div style="font-size:14px;letter-spacing:1px;text-transform:uppercase;opacity:0.8;">Payment Events</div>
                      <div style="font-size:24px;font-weight:700;margin-top:8px;">Pagamento confirmado</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 32px;">
                      <div style="font-size:16px;margin-bottom:16px;">Ola, ${receipt.personName}</div>
                      <div style="font-size:15px;line-height:1.6;margin-bottom:20px;">
                        Seu pagamento foi confirmado com sucesso. Segue um resumo:
                      </div>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="padding:12px 16px;background:#f7f8fa;border-radius:10px;">
                            <div style="font-size:12px;color:#6b7280;">Referencia</div>
                            <div style="font-size:16px;font-weight:600;">${receipt.reference}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px;background:#f7f8fa;border-radius:10px;margin-top:10px;display:block;">
                            <div style="font-size:12px;color:#6b7280;">Valor</div>
                            <div style="font-size:16px;font-weight:600;">${amountLine}</div>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:24px;font-size:13px;color:#6b7280;">
                        Se voce nao reconhece este pagamento, entre em contato com o suporte.
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 32px;background:#f7f8fa;font-size:12px;color:#6b7280;">
                      Payment Events • Pagamento ${receipt.reference}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `;
      const text = [
        'Pagamento confirmado',
        `Ola, ${receipt.personName}`,
        'Seu pagamento foi confirmado com sucesso.',
        `Referencia: ${receipt.reference}`,
        `Valor: ${amountLine}`,
        'Se voce nao reconhece este pagamento, entre em contato com o suporte.',
      ].join('\n');
      const pdfBuffer = await this.generateReceiptPdf(receipt);

      await transporter.sendMail({
        from,
        to: receipt.personEmail,
        subject: `Pagamento confirmado ${receipt.reference}`,
        html,
        text,
        attachments: [
          {
            filename: `recibo-${receipt.reference}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      await this.paymentsRepository.update(receipt.paymentId, {
        emailSent: true,
      });

      this.logger.log(
        `EMAIL OK paymentId = ${receipt.paymentId} TO = ${receipt.personEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `EMAIL FAILED paymentId = ${event.receipt.paymentId} TO = ${event.receipt.personEmail}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private generateReceiptPdf(receipt: PaymentReceipt): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error) => reject(error));

      doc
        .fontSize(20)
        .fillColor('#111827')
        .text('Recibo de Pagamento', { align: 'left' });
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text(`Gerado em: ${receipt.createdAt.toISOString()}`);
      doc.moveDown(1.5);

      doc.fontSize(12).fillColor('#111827').text('Dados do pagamento');
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .fillColor('#374151')
        .text(`Referencia: ${receipt.reference}`)
        .text(`Valor: ${receipt.amount} ${receipt.currency}`)
        .text(`Pagamento ID: ${receipt.paymentId}`);
      doc.moveDown(1.5);

      doc.fontSize(12).fillColor('#111827').text('Pagador');
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .fillColor('#374151')
        .text(`Nome: ${receipt.personName}`)
        .text(`Email: ${receipt.personEmail}`);

      doc.end();
    });
  }
}
