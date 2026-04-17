package com.smartcampus.ticket.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAttachmentResponse {

	private Long id;

	private String fileName;

	private String fileType;

	private String fileUrl;

	private String publicId;

	private Instant uploadedAt;
}
