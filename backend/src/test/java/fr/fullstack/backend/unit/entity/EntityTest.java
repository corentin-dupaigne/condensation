package fr.fullstack.backend.unit.entity;

import fr.fullstack.backend.entity.*;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EntityTest {

    @Test
    void balance_defaultsToZero() {
        Balance b = new Balance();

        assertThat(b.getBalance()).isZero();
        assertThat(b.getId()).isNull();
        assertThat(b.getUserId()).isNull();
    }

    @Test
    void balance_settersAndGetters() {
        Balance b = new Balance();
        b.setId(1);
        b.setUserId(42);
        b.setBalance(5000);

        assertThat(b.getId()).isEqualTo(1);
        assertThat(b.getUserId()).isEqualTo(42);
        assertThat(b.getBalance()).isEqualTo(5000);
    }

    @Test
    void game_defaultValuesMatchColumnDefaults() {
        Game g = new Game();

        assertThat(g.getRequiredAge()).isEqualTo((short) 0);
        assertThat(g.getRecommendationsTotal()).isZero();
        assertThat(g.getPlatformWindows()).isFalse();
        assertThat(g.getPlatformMac()).isFalse();
        assertThat(g.getPlatformLinux()).isFalse();
    }

    @Test
    void game_settersAndGetters() {
        Game g = new Game();
        g.setId(1L);
        g.setName("Portal");
        g.setSlug("portal");
        g.setSteamAppId(400);
        g.setPriceInitial(1999);
        g.setReductionPercentage(50);
        g.setCurrency("EUR");

        assertThat(g.getId()).isEqualTo(1L);
        assertThat(g.getName()).isEqualTo("Portal");
        assertThat(g.getSlug()).isEqualTo("portal");
        assertThat(g.getSteamAppId()).isEqualTo(400);
        assertThat(g.getPriceInitial()).isEqualTo(1999);
        assertThat(g.getReductionPercentage()).isEqualTo(50);
        assertThat(g.getCurrency()).isEqualTo("EUR");
    }

    @Test
    void genre_settersAndGetters() {
        Genre g = new Genre();
        g.setId(1);
        g.setDescription("Action");

        assertThat(g.getId()).isEqualTo(1);
        assertThat(g.getDescription()).isEqualTo("Action");
    }

    @Test
    void category_settersAndGetters() {
        Category c = new Category();
        c.setId(5);
        c.setDescription("Multi-player");

        assertThat(c.getId()).isEqualTo(5);
        assertThat(c.getDescription()).isEqualTo("Multi-player");
    }

    @Test
    void company_settersAndGetters() {
        Company c = new Company();
        c.setId(10);
        c.setName("Valve");

        assertThat(c.getId()).isEqualTo(10);
        assertThat(c.getName()).isEqualTo("Valve");
    }

    @Test
    void order_settersAndGetters() {
        Game g = new Game();
        Order o = new Order();
        o.setId(1);
        o.setUserId(7);
        o.setKey("ABCD-EFGH-IJKL");
        o.setGame(g);

        assertThat(o.getId()).isEqualTo(1);
        assertThat(o.getUserId()).isEqualTo(7);
        assertThat(o.getKey()).isEqualTo("ABCD-EFGH-IJKL");
        assertThat(o.getGame()).isSameAs(g);
    }

    @Test
    void steamKey_settersAndGetters() {
        Game g = new Game();
        SteamKey k = new SteamKey();
        k.setId(1);
        k.setKey("AAAA-BBBB-CCCC");
        k.setGame(g);

        assertThat(k.getId()).isEqualTo(1);
        assertThat(k.getKey()).isEqualTo("AAAA-BBBB-CCCC");
        assertThat(k.getGame()).isSameAs(g);
    }

    @Test
    void screenshot_defaultPositionIsZero() {
        Screenshot s = new Screenshot();

        assertThat(s.getPosition()).isEqualTo((short) 0);
    }

    @Test
    void screenshot_settersAndGetters() {
        Screenshot s = new Screenshot();
        s.setId(1L);
        s.setSteamId(100);
        s.setPathThumbnail("t.png");
        s.setPathFull("f.png");
        s.setPosition((short) 3);

        assertThat(s.getId()).isEqualTo(1L);
        assertThat(s.getSteamId()).isEqualTo(100);
        assertThat(s.getPathThumbnail()).isEqualTo("t.png");
        assertThat(s.getPathFull()).isEqualTo("f.png");
        assertThat(s.getPosition()).isEqualTo((short) 3);
    }

    @Test
    void movie_defaultsAndSetters() {
        Movie m = new Movie();

        assertThat(m.getHighlight()).isFalse();
        assertThat(m.getPosition()).isEqualTo((short) 0);

        m.setName("Trailer");
        m.setHighlight(true);
        m.setPosition((short) 5);

        assertThat(m.getName()).isEqualTo("Trailer");
        assertThat(m.getHighlight()).isTrue();
        assertThat(m.getPosition()).isEqualTo((short) 5);
    }

    @Test
    void gameCompany_initializesEmbeddedId() {
        GameCompany gc = new GameCompany();

        assertThat(gc.getId()).isNotNull();
    }

    @Test
    void gameCompanyId_equalsAndHashcode() {
        GameCompanyId a = new GameCompanyId();
        a.setGameId(1L);
        a.setCompanyId(10);
        a.setRole("developer");

        GameCompanyId b = new GameCompanyId();
        b.setGameId(1L);
        b.setCompanyId(10);
        b.setRole("developer");

        GameCompanyId c = new GameCompanyId();
        c.setGameId(2L);
        c.setCompanyId(10);
        c.setRole("developer");

        assertThat(a).isEqualTo(b);
        assertThat(a.hashCode()).isEqualTo(b.hashCode());
        assertThat(a).isNotEqualTo(c);
        assertThat(a).isEqualTo(a);
        assertThat(a).isNotEqualTo(null);
        assertThat(a).isNotEqualTo("not-an-id");
    }
}
