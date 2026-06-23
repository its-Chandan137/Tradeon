import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

interface TradeData {
  instrument: string;
  trade_type: string;
  entry_price?: number;
  exit_price?: number;
  lot_size?: number;
  profit_loss?: number;
  trade_date: string;
  screenshot_url?: string | null;
  notes?: string | null;
}

interface SendEmailRequest {
  userEmail: string;
  trade: TradeData;
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail, trade }: SendEmailRequest = await request.json();

    if (!userEmail || !trade) {
      return NextResponse.json(
        { error: "Missing required fields: userEmail, trade" },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
      console.error("SMTP credentials not configured");
      return NextResponse.json(
        { error: "SMTP credentials not configured" },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Format trade date
    const formattedDate = new Date(trade.trade_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format P/L with color
    const profitLoss = trade.profit_loss !== undefined && trade.profit_loss !== null
      ? trade.profit_loss
      : null;
    
    const profitLossColor = profitLoss && profitLoss >= 0 ? "#FFD700" : "#EF4444"; // Gold for profit, red for loss
    const profitLossText = profitLoss !== null
      ? `${profitLoss >= 0 ? "+" : ""}$${profitLoss.toFixed(2)}`
      : "—";

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trade Logged</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #1a1a2e; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="text-align: center; padding: 30px 20px; border-bottom: 2px solid #FFD700;">
      <h1 style="margin: 0; font-size: 28px; color: #FFD700; font-weight: bold;">Tradeon</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #a0a0a0;">Your Trading Journal</p>
    </div>

    <!-- Trade Summary -->
    <div style="padding: 30px 20px;">
      <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #FFD700;">Trade Logged Successfully</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #a0a0a0; font-size: 14px;">Instrument</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; font-weight: bold; font-size: 14px;">${trade.instrument}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #a0a0a0; font-size: 14px;">Type</td>
          <td style="padding: 12px; border-bottom: 1px solid #333;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; background-color: ${trade.trade_type === 'BUY' ? '#10B981' : '#EF4444'}; color: white;">${trade.trade_type}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #a0a0a0; font-size: 14px;">Entry Price</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; font-size: 14px;">${trade.entry_price ? trade.entry_price.toFixed(5) : "—"}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #a0a0a0; font-size: 14px;">Exit Price</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; font-size: 14px;">${trade.exit_price ? trade.exit_price.toFixed(5) : "—"}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #a0a0a0; font-size: 14px;">Lot Size</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; font-size: 14px;">${trade.lot_size ? trade.lot_size.toFixed(2) : "—"}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #a0a0a0; font-size: 14px;">Profit/Loss</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; font-size: 14px; font-weight: bold; color: ${profitLossColor};">${profitLossText}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #a0a0a0; font-size: 14px;">Date</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; font-size: 14px;">${formattedDate}</td>
        </tr>
      </table>

      ${trade.screenshot_url ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${trade.screenshot_url}" style="display: inline-block; padding: 12px 24px; background-color: #FFD700; color: #1a1a2e; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View Screenshot</a>
      </div>
      ` : ''}

      ${trade.notes ? `
      <div style="margin-top: 30px; padding: 20px; background-color: #252540; border-radius: 8px; border-left: 4px solid #FFD700;">
        <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #FFD700;">Notes</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e0e0e0;">${trade.notes}</p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; border-top: 1px solid #333; color: #666; font-size: 12px;">
      <p style="margin: 0;">This is an automated record from your Tradeon trading journal.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    await transporter.sendMail({
      from: smtpFrom,
      to: userEmail,
      subject: `Tradeon — Trade Logged: ${trade.instrument} ${trade.trade_type} on ${formattedDate}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
