import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue')
    },
    {
      path: '/components',
      name: 'ComponentShowcase',
      component: () => import('../views/ComponentShowcase.vue')
    },
    {
      path: '/permissions',
      name: 'PermissionTableDemo',
      component: () => import('../views/PermissionTableDemo.vue')
    },
    {
      path: '/communityhub/guildprofile',
      name: 'GuildProfile',
      component: () => import('../views/GuildProfile.vue')
    },
    {
      path: '/communityhub/memberprofile',
      name: 'MemberProfile',
      component: () => import('../views/MemberProfile.vue')
    },
    {
      path: '/foundry',
      redirect: '/foundry/nft'
    },
    {
      path: '/foundry/nft',
      name: 'FoundryNFT',
      component: () => import('../views/FoundryNFT.vue')
    },
    {
      path: '/foundry/token1',
      name: 'FoundryToken1',
      component: () => import('../views/FoundryToken1.vue')
    },
    {
      path: '/foundry/token2',
      name: 'FoundryToken2',
      component: () => import('../views/FoundryToken2.vue')
    },
    {
      path: '/foundry/custom',
      name: 'FoundryCustom',
      component: () => import('../views/FoundryCustom.vue')
    },
    {
      path: '/vaults',
      name: 'Vaults',
      component: () => import('../views/Vaults.vue')
    },
    {
      path: '/vaults/v2',
      name: 'VaultsV2',
      component: () => import('../views/VaultsV2.vue')
    },
    {
      path: '/dao-voting',
      name: 'DAOVoting',
      component: () => import('../views/DAOVoting.vue')
    },
    {
      path: '/tavern/events',
      name: 'TavernEvents',
      component: () => import('../views/TavernEvents.vue')
    },
    {
      path: '/tavern/raffles',
      name: 'TavernRaffles',
      component: () => import('../views/TavernRaffles.vue')
    },
    {
      path: '/tavern/poker',
      name: 'TavernPoker',
      component: () => import('../views/TavernPoker.vue')
    },
    {
      path: '/tavern/dice',
      name: 'TavernDice',
      component: () => import('../views/TavernDice.vue')
    },
    {
      path: '/trophy-room',
      name: 'TrophyRoom',
      component: () => import('../views/TrophyRoom.vue')
    },
    {
      path: '/gatekeeping',
      name: 'Gatekeeping',
      component: () => import('../views/Gatekeeping.vue')
    },
    {
      path: '/quest/game',
      name: 'QuestBoardInGame',
      component: () => import('../views/QuestBoardInGame.vue')
    },
    {
      path: '/quest/guild',
      name: 'QuestBoardGuild',
      component: () => import('../views/QuestBoardGuild.vue')
    },
    {
      path: '/armory/g2p',
      name: 'ArmoryG2P',
      component: () => import('../views/ArmoryG2P.vue')
    },
    {
      path: '/integrations',
      name: 'Integrations',
      component: () => import('../views/Integration.vue')
    },
    {
      path: '/reports',
      redirect: '/reports/personal'
    },
    {
      path: '/reports/personal',
      name: 'ObservatoryPersonal',
      component: () => import('../views/ObservatoryPersonal.vue')
    },
    {
      path: '/reports/dguild',
      name: 'ObservatoryDGuild',
      component: () => import('../views/ObservatoryDGuild.vue')
    },
    {
      path: '/reports/financial',
      name: 'ObservatoryFinancial',
      component: () => import('../views/ObservatoryFinancial.vue')
    },
    {
      path: '/demo/personal-observatory',
      name: 'PersonalObservatoryDemo',
      component: () => import('../views/PersonalObservatoryDemo.vue')
    },
    {
      path: '/commandcenter',
      name: 'CommandCenter',
      component: () => import('../views/CommandCenter.vue')
    }
  ],
})

export default router
