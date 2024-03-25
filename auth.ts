import NextAuth, { User } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
const ldap = require("ldapjs");
import fs from 'fs';

const IDENTIFIANTS_INVALIDES = 'Identifiants invalides';

// Définir un schéma pour la validation des credentials
const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

type UserExtend = User & {
    plus: any;
}

// Valider les credentials
function validateCredentials(credentials: Partial<Record<string, unknown>>) {
    try {
      return credentialsSchema.parse(credentials);
    } catch (error) {
      console.error('Erreur de validation des credentials:', error);
      throw new Error('Identifiants invalides');
    }
  }

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
        async authorize(credentials, request) {

            const validatedCredentials = validateCredentials(credentials);
            const userPrincipalName: string = validatedCredentials.email;
            const password: string = validatedCredentials.password;

            return authenticateLDAP(userPrincipalName, password)
            .then((userAuth) => {
                return {
                    plus: userAuth.userPrincipalName,
                    name: userAuth.displayName
                } as UserExtend;
            })
            .catch((error) => {
                console.error('Erreur d\'authentification LDAP:', error);
            });

            // try {
            //     const user = await authenticateLDAP(email, password);
            //     console.log('Utilisateur authentifié', user);
            //     const us: User = {
            //         email: user.username,
            //         name: user.displayName
            //     };
            //     return us; // Renvoyer les informations de l'utilisateur
            //   } catch (error) {
            //     console.error('Erreur d\'authentification LDAP:', error);
            //     throw new Error('Identifiants invalides');
            //   }
        }
    })
  ],
});

async function authenticateLDAP(userPrincipalName: string, password: string): Promise<any> {
    // Configuration LDAP
    const ldapConfig = {
        url: 'ldaps://dom1.vinci-energies.net:636',
        baseDN: 'OU=FR,OU=VE,DC=dom1,DC=vinci-energies,DC=net',
        displayNameAttribute: 'displayName',
        dn: 'distinguishedName',
        usersFilter: `(&(userPrincipalName=${userPrincipalName})(objectClass=person))`
    };

    // Création du client LDAP
    const client = ldap.createClient({
        url: ldapConfig.url,
        tlsOptions: {
            rejectUnauthorized: false, // Ignorer les erreurs de certificat pour les connexions LDAPS
        },
    });

    // Tentative de liaison avec les identifiants fournis
    return new Promise((resolve, reject) => {
        client.bind(`CN=SERVICE MANCHE APPMETIER SVC,OU=Service Account,OU=T2,OU=Services Accounts,DC=dom1,DC=vinci-energies,DC=net`, 'dAhPb%9"#|5L0}@d1tsc', (error: any) => {
            if (error) {
                console.error('Erreur de liaison LDAP:', error);
                reject(IDENTIFIANTS_INVALIDES);
            } else {
                // Liaison réussie, récupération des informations d'utilisateur
                client.search(ldapConfig.baseDN, {
                    filter: ldapConfig.usersFilter,
                    scope: 'sub',
                }, (searchError: any, searchResult: any) => {
                    if (searchError) {
                        console.error('Erreur de recherche LDAP:', searchError);
                        reject(IDENTIFIANTS_INVALIDES);
                    } else {
                        searchResult.on('searchEntry', (entry: any) => {
                            const attrs: [] = entry.pojo.attributes;
                            const userDn: any = attrs.find((attr: any) => attr.type === ldapConfig.dn);
                            const userDisplayName: any = attrs.find((attr: any) => attr.type === ldapConfig.displayNameAttribute);

                            // console.log('toto', userDn, userDisplayName);

                            // Récupération des attributs d'utilisateur (par exemple, displayName)
                            const dn = userDn.values[0];
                            const displayName = userDisplayName.values[0];

                            client.bind(dn, password, (bindError: any) => {
                                if (bindError) {
                                    console.error('Erreur de liaison LDAP:', bindError);
                                    reject(IDENTIFIANTS_INVALIDES);
                                } else {
                                    // console.log('hhiiihihhi', username, displayName);
                                    // Liaison réussie, renvoyer les informations de l'utilisateur
                                    resolve({ userPrincipalName, displayName});
                                }
                            });
                        });
                        searchResult.on('error', (err: any) => {
                            console.error('Erreur de recherche LDAP:', err);
                            reject(IDENTIFIANTS_INVALIDES);
                        });
                    }
                });
            }
        });
    });
}
