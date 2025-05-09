import axios from 'axios';
import { WHATSAPP_CONFIG } from '../config/whatsapp';

interface CreateGroupResponse {
  groupId: string;
  groupName: string;
}

export const whatsappService = {
  async createGroup(phoneNumbers: string[], groupName: string): Promise<CreateGroupResponse> {
    try {
      // First, create a group
      const createGroupResponse = await axios.post(
        `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.businessAccountId}/groups`,
        {
          name: groupName,
          description: 'Quiz Group'
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const groupId = createGroupResponse.data.id;

      // Add participants to the group
      for (const phoneNumber of phoneNumbers) {
        await axios.post(
          `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.businessAccountId}/groups/${groupId}/participants`,
          {
            phone_numbers: [phoneNumber]
          },
          {
            headers: {
              'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Send welcome message
      await axios.post(
        `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: groupId,
          type: 'text',
          text: {
            body: `Welcome to the ${groupName} quiz group! The quiz will start soon.`
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        groupId,
        groupName
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error);
      throw new Error('Failed to create WhatsApp group. Please check your WhatsApp API configuration.');
    }
  }
}; 