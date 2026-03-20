# frozen_string_literal: true

# Pre-fill support ticket email from the same OIDC file batch-connect apps use, so the
# field can stay hidden (see ondemand.d/support_ticket.yml attributes.email).
module SupportTicketOidcEmail
  module_function

  def fill(ticket)
    return unless ticket.respond_to?(:email=)
    return if ticket.email.to_s.strip.present?

    path = File.expand_path('~/ondemand/oidc_email.txt')
    return unless File.readable?(path)

    ticket.email = File.read(path).strip
  rescue StandardError => e
    Rails.logger.warn("[support_ticket_oidc_email] #{e.class}: #{e.message}")
  end

  module PrependedDefault
    def default_support_ticket(...)
      ticket = super(...)
      SupportTicketOidcEmail.fill(ticket)
      ticket
    end
  end

  module PrependedBoth
    def default_support_ticket(...)
      ticket = super(...)
      SupportTicketOidcEmail.fill(ticket)
      ticket
    end

    def validate_support_ticket(...)
      ticket = super(...)
      SupportTicketOidcEmail.fill(ticket)
      ticket
    end
  end
end

Rails.application.config.to_prepare do
  %w[
    EmailSupportTicketService
    SupportTicket::EmailSupportTicketService
  ].each do |name|
    klass = name.safe_constantize
    next unless klass.is_a?(Class)
    next unless klass.method_defined?(:default_support_ticket)
    next if klass.ancestors.include?(SupportTicketOidcEmail::PrependedDefault) ||
            klass.ancestors.include?(SupportTicketOidcEmail::PrependedBoth)

    if klass.method_defined?(:validate_support_ticket)
      klass.prepend(SupportTicketOidcEmail::PrependedBoth)
    else
      klass.prepend(SupportTicketOidcEmail::PrependedDefault)
    end
  end
end
