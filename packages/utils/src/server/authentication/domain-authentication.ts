export const generateDomainBasedToken = () => {
  const domain = process.env.API_DOMAIN;
  const domainKey = process.env.API_KEY;
  return Buffer.from(domain + "|" + domainKey).toString("base64");
};